import { NextResponse } from 'next/server';
import { testEmailConnection } from '@/lib/test-email';

export const dynamic = 'force-dynamic';

/**
 * API endpoint emaili testimiseks
 * GET /api/test-email - Testib SMTP ühendust ja saadab test emaili
 */
export async function GET() {
  try {
    const result = await testEmailConnection();
    return NextResponse.json({
      success: true,
      message: 'Test email saadetud edukalt!',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    const code = error?.code || '';
    const hint =
      ['EDNS', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)
        ? 'DNS viga – proovi SMTP_HOST=smtp.alfanetti.ee (Alfanet) või kontrolli mail.papagoi.ee'
        : ['EAUTH'].includes(code)
          ? 'Autentimise viga – kontrolli SMTP_USER ja SMTP_PASSWORD Vercelis'
          : ['ETIMEDOUT', 'ECONNREFUSED'].includes(code)
            ? 'Ühendus aegus – kontrolli SMTP_HOST ja SMTP_PORT (587)'
            : null;
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Emaili test ebaõnnestus',
        code,
        hint,
      },
      { status: 500 }
    );
  }
}



