import { NextRequest, NextResponse } from 'next/server';
import { createTransporter } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * SMTP diagnostika – kontrollib, kas e-posti seaded on olemas ja ühendus töötab.
 * GET /api/health/email – tagastab staatuse ilma emaili saatmata.
 *
 * Production: tagastab ainult "ok" või veateate (ilma tundliku infota).
 * Development või ?secret=XXX: tagastab täpsema diagnoosi.
 */
export async function GET(request: NextRequest) {
  const isDev = process.env.NODE_ENV === 'development';
  const secret = request.nextUrl.searchParams.get('secret');
  const allowedSecret = process.env.EMAIL_DIAGNOSTIC_SECRET;
  const showDetails = isDev || (allowedSecret && secret === allowedSecret);

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const port = process.env.SMTP_PORT;

  const configStatus = {
    SMTP_HOST: !!host,
    SMTP_PORT: !!port,
    SMTP_USER: !!user,
    SMTP_PASSWORD: !!password,
  };

  if (!host || !user || !password) {
    return NextResponse.json(
      {
        ok: false,
        error: 'SMTP seaded puuduvad',
        ...(showDetails && {
          config: configStatus,
          hint: 'Lisa Vercelis: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD',
        }),
      },
      { status: 500 }
    );
  }

  if (!showDetails) {
    return NextResponse.json({ ok: true, message: 'SMTP seaded on seadistatud' });
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    return NextResponse.json({
      ok: true,
      message: 'SMTP ühendus töötab',
      config: { ...configStatus, host: host, port: port || '587' },
    });
  } catch (error: any) {
    const code = error?.code || '';
    const msg = error?.message || String(error);
    const hint =
      ['EDNS', 'ENOTFOUND', 'EAI_AGAIN'].includes(code)
        ? 'DNS viga – proovi SMTP_HOST=mail.papagoi.ee või smtp.alfanetti.ee (Alfanet)'
        : ['EAUTH', 'EENVELOPE'].includes(code)
          ? 'Autentimise viga – kontrolli SMTP_USER ja SMTP_PASSWORD'
          : ['ETIMEDOUT', 'ECONNREFUSED'].includes(code)
            ? 'Ühendus ebaõnnestus – kontrolli SMTP_HOST ja SMTP_PORT (587 või 465)'
            : null;

    return NextResponse.json(
      {
        ok: false,
        error: msg,
        code,
        hint,
        config: configStatus,
      },
      { status: 500 }
    );
  }
}
