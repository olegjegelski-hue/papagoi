
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingEmail } from '@/lib/email';
import { findOrCreateVisit, createVisitor } from '@/lib/notion-booking';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/errors';
import { captureError } from '@/lib/sentry';
import { isAllowedOrigin } from '@/lib/origin';
import { cleanText } from '@/lib/sanitize';

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
}) {
  try {
    const visitId = await findOrCreateVisit({
      date: payload.date || '',
      timeSlot: payload.timeSlot,
      totalPrice: payload.totalPrice,
    });
    if (!visitId) return;
    await createVisitor({
      visitPageId: visitId,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      groupSize: payload.groupSize,
      groupType: payload.groupType,
      message: payload.message,
      totalPrice: payload.totalPrice,
      visitLanguage: payload.visitLanguage,
    });
  } catch (err) {
    console.error('Notion broneering salvestamine ebaõnnestus:', err);
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
    const isJoinRequest = Boolean(joinExisting);

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
    const minGroupSize = isJoinRequest ? 1 : 3;
    if (isNaN(groupSizeNum) || groupSizeNum < minGroupSize) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', `Minimaalne grupi suurus on ${minGroupSize} inimest`),
        { status: 400 }
      );
    }

    // Calculate total price (10€ inimene)
    const basePrice = 10; // EUR per person
    const totalPrice = groupSizeNum * basePrice;

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

    // Salvesta Notioni (Külastused + Külastajad) – ei muuda olemasolevaid kirjeid
    const dateStr = bookingDate ? bookingDate.toISOString().slice(0, 10) : cleaned.date;
    if (dateStr) {
      await saveBookingToNotion({
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
    });
    }

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
