
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingEmail } from '@/lib/email';
import { reserveVisitSlot, createVisitor } from '@/lib/notion-booking';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/errors';
import { captureError } from '@/lib/sentry';
import { isAllowedOrigin } from '@/lib/origin';
import { cleanText } from '@/lib/sanitize';
import {
  VIP_MAX_PEOPLE,
  VIP_MIN_PEOPLE,
  isVipGroupType,
  isVipTimeAllowed,
  vipVisitPrice,
} from '@/lib/vip-visit';

export const dynamic = 'force-dynamic';

function parseVisitLanguage(raw: unknown): 'et' | 'en' | 'ru' {
  const s = typeof raw === 'string' ? raw.trim().toLowerCase() : '';
  if (s === 'en' || s === 'ru' || s === 'et') return s;
  return 'et';
}

async function saveBookingToNotion(payload: {
  name: string;
  email: string;
  phone: string;
  date?: string;
  timeSlot?: string;
  groupSize: number;
  groupType?: string;
  message?: string;
  totalPrice?: number;
  visitLanguage?: 'et' | 'en' | 'ru';
  vip?: boolean;
}): Promise<{ ok: true } | { ok: false; reason: 'SLOT_VIP' | 'SLOT_OCCUPIED' | 'NOTION_ERROR' }> {
  try {
    const reserved = await reserveVisitSlot({
      date: payload.date || '',
      timeSlot: payload.timeSlot,
      totalPrice: payload.totalPrice,
      vip: payload.vip,
    });
    if (!reserved.ok) return reserved;
    const created = await createVisitor({
      visitPageId: reserved.visitId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      groupSize: payload.groupSize,
      groupType: payload.groupType,
      message: payload.message,
      totalPrice: payload.totalPrice,
      visitLanguage: payload.visitLanguage,
    });
    if (!created) return { ok: false, reason: 'NOTION_ERROR' };
    return { ok: true };
  } catch (err) {
    console.error('Notion broneering salvestamine ebaõnnestus:', err);
    return { ok: false, reason: 'NOTION_ERROR' };
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json(
        errorResponse('FORBIDDEN', 'Päring pole lubatud.'),
        { status: 403 }
      );
    }

    const body = await request.json();
    
    const {
      name,
      email,
      phone,
      date,
      timeSlot,
      groupSize,
      groupType,
      message = '',
      website, // honeypot (optional)
      joinExisting,
      visitLanguage: rawVisitLanguage,
    } = body;

    const cleaned = {
      name: cleanText(name, { max: 120 }),
      email: cleanText(email, { max: 254 }),
      phone: cleanText(phone, { max: 40 }),
      date: cleanText(date, { max: 40 }),
      timeSlot: cleanText(timeSlot, { max: 20 }),
      groupSize: cleanText(groupSize, { max: 10 }),
      groupType: cleanText(groupType, { max: 50 }),
      message: cleanText(message, { max: 2000, preserveNewlines: true }),
      website: cleanText(website, { max: 200 }),
    };
    const visitLanguage = parseVisitLanguage(rawVisitLanguage);
    const isVip = isVipGroupType(cleaned.groupType);
    const isJoinRequest = isVip ? false : Boolean(joinExisting);

    // Validate required fields
    if (!cleaned.name || !cleaned.email || !cleaned.phone || !cleaned.groupSize) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Kõik kohustuslikud väljad peavad olema täidetud'),
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleaned.email)) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Palun sisestage kehtiv e-posti aadress'),
        { status: 400 }
      );
    }

    // Validate phone format (Estonia +372)
    const normalizedPhone = cleaned.phone.replace(/\s+/g, '');
    const phoneRegex = /^\+372\d{7,8}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Telefon peab olema Eesti suunakoodiga +372'),
        { status: 400 }
      );
    }

    // Honeypot check
    if (cleaned.website && cleaned.website.trim().length > 0) {
      return NextResponse.json(
        {
          success: true,
          message: 'Broneering edukalt esitatud! Võtame teiega ühendust 24 tunni jooksul.'
        },
        { status: 201 }
      );
    }

    // Rate limit per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(ip, { windowMs: 10 * 60 * 1000, max: 10, minIntervalMs: 5 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        errorResponse('RATE_LIMITED', 'Päringuid on liiga palju. Palun proovige mõne hetke pärast uuesti.'),
        { status: 429 }
      );
    }

    // Optional: Validate date (should be in the future)
    let bookingDate: Date | undefined = undefined;
    if (cleaned.date) {
      bookingDate = new Date(cleaned.date);
      if (Number.isNaN(bookingDate.getTime())) {
        return NextResponse.json(
          errorResponse('VALIDATION_ERROR', 'Palun sisestage kehtiv kuupäev'),
          { status: 400 }
        );
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (bookingDate < today) {
        return NextResponse.json(
          errorResponse('VALIDATION_ERROR', 'Broneeringu kuupäev ei saa olla minevikus'),
          { status: 400 }
        );
      }
    }

    // Validate group size
    const groupSizeNum = Number(cleaned.groupSize);
    const minGroupSize = isVip ? VIP_MIN_PEOPLE : isJoinRequest ? 1 : 3;
    if (isNaN(groupSizeNum) || groupSizeNum < minGroupSize) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', `Minimaalne grupi suurus on ${minGroupSize} inimest`),
        { status: 400 }
      );
    }
    if (isVip && groupSizeNum > VIP_MAX_PEOPLE) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', `VIP külastusel on maksimaalselt ${VIP_MAX_PEOPLE} inimest`),
        { status: 400 }
      );
    }

    const dateStr = /^\d{4}-\d{2}-\d{2}/.test(cleaned.date)
      ? cleaned.date.slice(0, 10)
      : bookingDate
        ? bookingDate.toISOString().slice(0, 10)
        : cleaned.date;

    if (isVip) {
      if (!cleaned.timeSlot || !dateStr || !isVipTimeAllowed(dateStr, cleaned.timeSlot)) {
        return NextResponse.json(
          errorResponse(
            'VALIDATION_ERROR',
            'VIP külastuseks palun valige lubatud aeg (tööpäeviti 10:00–18:00; nädalavahetusel ja riigipühadel 10:00 või 18:00).'
          ),
          { status: 400 }
        );
      }
    }

    // Hind: tavakülastus 10€/inimene; VIP astmetabel (jagatud funktsioon)
    const vipPrice = isVip ? vipVisitPrice(groupSizeNum) : null;
    if (isVip && vipPrice == null) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'VIP külastuse inimeste arv peab olema 1–20'),
        { status: 400 }
      );
    }
    const totalPrice = isVip ? Number(vipPrice) : groupSizeNum * 10;

    // Salvesta Notioni enne kirja — VIP/tavaslotti kontrollitakse uuesti submiti hetkel
    if (dateStr) {
      const saved = await saveBookingToNotion({
        name: cleaned.name,
        email: cleaned.email,
        phone: cleaned.phone,
        date: dateStr || undefined,
        timeSlot: cleaned.timeSlot || undefined,
        groupSize: groupSizeNum,
        groupType: cleaned.groupType || undefined,
        message: cleaned.message ? cleaned.message : undefined,
        totalPrice: Number(totalPrice),
        visitLanguage,
        vip: isVip,
      });
      if (!saved.ok) {
        if (saved.reason === 'SLOT_VIP') {
          return NextResponse.json(
            errorResponse(
              'VALIDATION_ERROR',
              'See aeg on VIP külastuseks suletud. Palun valige teine aeg.'
            ),
            { status: 409 }
          );
        }
        if (saved.reason === 'SLOT_OCCUPIED') {
          return NextResponse.json(
            errorResponse(
              'VALIDATION_ERROR',
              'VIP külastust saab broneerida ainult täiesti tühjale ajale. Palun valige teine aeg.'
            ),
            { status: 409 }
          );
        }
      }
    }

    // Saada email
    await sendBookingEmail({
      name: cleaned.name,
      email: cleaned.email,
      phone: cleaned.phone,
      date: bookingDate,
      timeSlot: cleaned.timeSlot || undefined,
      groupSize: groupSizeNum,
      groupType: cleaned.groupType || undefined,
      message: cleaned.message ? cleaned.message : undefined,
      totalPrice: Number(totalPrice),
      bookingId: `BKG-${Date.now()}`,
      visitLanguage,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Broneering edukalt esitatud! Võtame teiega ühendust 24 tunni jooksul.',
        booking: {
          id: `BKG-${Date.now()}`,
          totalPrice: Number(totalPrice),
          date: bookingDate,
          timeSlot: cleaned.timeSlot || null,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    const errorId = captureError(error);
    console.error('Booking error:', error);
    const message =
      'Broneeringu saatmisel tekkis viga. Palun proovige uuesti või võtke meiega otse ühendust.';
    const showDetails = process.env.NODE_ENV === 'development' || !!process.env.DEBUG_EMAIL_ERRORS;
    return NextResponse.json(
      errorResponse('SERVER_ERROR', message, { errorId, details: showDetails ? error?.message : undefined }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Papagoi Keskus booking API' },
    { status: 200 }
  );
}
