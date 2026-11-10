import { NextResponse } from 'next/server';
import { requireCronAuth } from '@/lib/cron-auth';
import { testEmailConnection } from '@/lib/test-email';

export const dynamic = 'force-dynamic';

/**
 * API endpoint emaili testimiseks.
 * GET /api/test-email — testib SMTP ühendust ja saadab testkirja.
 * Sama kaitse nagu cron-endpointidel: Authorization: Bearer ${CRON_SECRET}.
 */
export async function GET(request: Request) {
  const unauthorized = requireCronAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const result = await testEmailConnection();
    return NextResponse.json({
      success: true,
      message: 'Test email saadetud edukalt!',
      messageId: result.messageId,
    });
  } catch (error: any) {
    console.error('Email test error:', error);
    const isProd = process.env.NODE_ENV === 'production';
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
      isProd
        ? { success: false, error: 'Emaili test ebaõnnestus' }
        : {
            success: false,
            error: error?.message || 'Emaili test ebaõnnestus',
            code,
            hint,
          },
      { status: 500 }
    );
  }
}
