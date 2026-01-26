
import { NextRequest, NextResponse } from 'next/server';
import { sendContactFormEmail } from '@/lib/email';
import { getClientIp, rateLimit } from '@/lib/rate-limit';
import { errorResponse } from '@/lib/errors';
import { captureError } from '@/lib/sentry';
import { isAllowedOrigin } from '@/lib/origin';
import { cleanText, toStringSafe } from '@/lib/sanitize';

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
      phone = '',
      message,
      formType = 'contact',
      website // honeypot
    } = body;

    const cleaned = {
      name: cleanText(name, { max: 120 }),
      email: cleanText(email, { max: 254 }),
      phone: phone ? cleanText(phone, { max: 40 }) : '',
      message: cleanText(message, { max: 2000, preserveNewlines: true }),
      formType: cleanText(formType, { max: 50 }),
      website: cleanText(website, { max: 200 }),
    };

    // Validate required fields
    if (!cleaned.name || !cleaned.email || !cleaned.phone || !cleaned.message) {
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
    if (cleaned.website && toStringSafe(cleaned.website).trim().length > 0) {
      // Bot submission: act as success but do nothing
      return NextResponse.json(
        { success: true, message: 'Teie sõnum on edukalt saadetud! Vastame teile esimesel võimalusel.' },
        { status: 201 }
      );
    }

    // Rate limit per IP
    const ip = getClientIp(request.headers);
    const rl = rateLimit(ip, { windowMs: 10 * 60 * 1000, max: 8, minIntervalMs: 10 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        errorResponse('RATE_LIMITED', 'Päringuid on liiga palju. Palun proovige mõne hetke pärast uuesti.'),
        { status: 429 }
      );
    }

    // Saada emailid (ilma andmebaasi salvestuseta)
    await sendContactFormEmail({
      name: cleaned.name,
      email: cleaned.email,
      phone: cleaned.phone,
      subject: 'Kontaktvormi sõnum',
      message: cleaned.message,
      formType: cleaned.formType ? cleaned.formType : undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Teie sõnum on edukalt saadetud! Vastame teile esimesel võimalusel.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    const errorId = captureError(error);
    console.error('Contact form error:', error);
    const message =
      'Sõnumi saatmisel tekkis viga. Palun proovige uuesti või helistage meile otse.';
    return NextResponse.json(
      errorResponse('SERVER_ERROR', message, {
        errorId,
        details: error?.message,
      }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Papagoi Keskus contact API' },
    { status: 200 }
  );
}
