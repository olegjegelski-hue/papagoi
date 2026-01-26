import { NextRequest } from 'next/server';

function normalizeOrigin(url: string): string | null {
  try {
    const u = new URL(url);
    return u.origin;
  } catch {
    return null;
  }
}

/**
 * Optional CSRF-ish protection for public APIs:
 * If NEXT_PUBLIC_SITE_URL is set and request has an Origin header,
 * only allow requests from the same origin.
 */
export function isAllowedOrigin(req: NextRequest): boolean {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return true;

  const allowed = normalizeOrigin(configured);
  if (!allowed) return true;

  const origin = req.headers.get('origin');
  if (!origin) return true; // allow non-browser clients

  return origin === allowed;
}




