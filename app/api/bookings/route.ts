
import { NextRequest, NextResponse } from 'next/server';
import { sendBookingEmail } from '@/lib/email';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/errors';
import { captureError } from '@/lib/sentry';
import { isAllowedOrigin } from '@/lib/origin';
import { cleanText } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

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
      website // honeypot (optional)
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
    if (isNaN(groupSizeNum) || groupSizeNum < 3) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Minimaalne grupi suurus on 3 inimest'),
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
