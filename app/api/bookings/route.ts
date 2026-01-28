
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingEmail } from '@/lib/email';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/errors';
import { captureError } from '@/lib/sentry';
import { isAllowedOrigin } from '@/lib/origin';
import { cleanText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

async function createNotionBooking(payload: {
  name: string;
  email: string;
  phone: string;
  date?: string;
  timeSlot?: string;
  groupSize?: number;
  groupType?: string;
  message?: string;
  totalPrice?: number;
}) {
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_VISITS_DATABASE_ID = process.env.NOTION_VISITS_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_VISITS_DATABASE_ID) {
    return;
  }

  const databaseId = NOTION_VISITS_DATABASE_ID.replace(/-/g, '');
  const dbResponse = await fetch(`https://api.notion.com/v1/databases/${databaseId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
    },
  });

  if (!dbResponse.ok) {
    const errorText = await dbResponse.text();
    throw new Error(`Notion database viga: ${dbResponse.status} - ${errorText}`);
  }

  const dbData = await dbResponse.json();
  const properties = dbData.properties || {};
  const titlePropertyName = Object.keys(properties).find(
    (key) => properties[key]?.type === 'title'
  );
  const datePropertyName = Object.keys(properties).find((key) => {
    const normalized = key.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '');
    return properties[key]?.type === 'date' && (normalized === 'kuupaev' || normalized.includes('kuupaev'));
  });
  const timePropertyName = Object.keys(properties).find((key) => {
    const normalized = key.toLowerCase().replace(/ä/g, 'a').replace(/\s+/g, '');
    return normalized === 'kellaaeg' || normalized === 'aeg' || normalized.includes('kellaaeg');
  });

  if (!titlePropertyName) {
    throw new Error('Notion database title property puudub.');
  }

  const titleParts = [
    payload.name,
    payload.date ? payload.date : 'Kuupäev määramata',
    payload.timeSlot ? payload.timeSlot : '',
  ].filter(Boolean);

  const children = [
    `Nimi: ${payload.name}`,
    `E-post: ${payload.email}`,
    `Telefon: ${payload.phone}`,
    `Kuupäev: ${payload.date || '-'}`,
    `Kellaaeg: ${payload.timeSlot || '-'}`,
    `Inimeste arv: ${payload.groupSize ?? '-'}`,
    `Grupi tüüp: ${payload.groupType || '-'}`,
    `Lisainfo: ${payload.message || '-'}`,
    `Hind: ${payload.totalPrice ? `${payload.totalPrice} EUR` : '-'}`,
  ].map((text) => ({
    object: 'block',
    type: 'paragraph',
    paragraph: {
      rich_text: [{ type: 'text', text: { content: text } }],
    },
  }));

  const notionProperties: Record<string, any> = {
    [titlePropertyName]: {
      title: [{ type: 'text', text: { content: titleParts.join(' — ') } }],
    },
  };

  if (datePropertyName && payload.date) {
    const dateWithTime = payload.timeSlot
      ? `${payload.date}T${payload.timeSlot}:00`
      : payload.date
    notionProperties[datePropertyName] = {
      date: { start: dateWithTime },
    };
  }

  if (timePropertyName && payload.timeSlot) {
    notionProperties[timePropertyName] = { select: { name: payload.timeSlot } };
  }

  const createResponse = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: notionProperties,
      children,
    }),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(`Notion create page viga: ${createResponse.status} - ${errorText}`);
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
      joinExisting
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
    const rl = rateLimit(ip, { windowMs: 10 * 60 * 1000, max: 5, minIntervalMs: 15 * 1000 });
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

    // Send emails (ilma andmebaasi salvestuseta)
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
    return NextResponse.json(
      errorResponse('SERVER_ERROR', message, { errorId, details: error?.message }),
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
