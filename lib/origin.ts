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
 * only allow requests from the same origin (www ja ilma www versioon).
 */
export function isAllowedOrigin(req: NextRequest): boolean {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (!configured) return true;

  const allowed = normalizeOrigin(configured);
  if (!allowed) return true;

  const origin = req.headers.get('origin');
  if (!origin) return true; // allow non-browser clients

  if (origin === allowed) return true;

  // Lubada ka www / ilma www variant (nt papagoi.ee ja www.papagoi.ee)
  try {
    const allowedUrl = new URL(allowed);
    const originUrl = new URL(origin);
    if (allowedUrl.hostname === originUrl.hostname) return true;
    const allowedHost = allowedUrl.hostname.replace(/^www\./, '') || allowedUrl.hostname;
    const originHost = originUrl.hostname.replace(/^www\./, '') || originUrl.hostname;
    return allowedHost === originHost;
  } catch {
    return false;
  }
}




