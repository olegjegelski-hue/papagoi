export function toStringSafe(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

export function stripControlChars(input: string): string {
  // Remove non-printable control chars (keep \n \r \t)
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/[ \t]+/g, ' ').trim();
}

export function limitLength(input: string, max: number): string {
  if (input.length <= max) return input;
  return input.slice(0, max);
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanText(value: unknown, opts: { max: number; preserveNewlines?: boolean } ): string {
  const raw = stripControlChars(toStringSafe(value));
  const trimmed = opts.preserveNewlines ? raw.trim() : normalizeWhitespace(raw);
  return limitLength(trimmed, opts.max);
}




