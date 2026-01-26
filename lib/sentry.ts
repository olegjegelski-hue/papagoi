let sentryInstance: any | null = null;
let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;
  try {
    // Lazy require to avoid bundling if not used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require('@sentry/node');
    Sentry.init({
      dsn,
      tracesSampleRate: 0,
    });
    sentryInstance = Sentry;
    initialized = true;
  } catch {
    // no-op if package not installed
  }
}

export function captureError(error: unknown): string | undefined {
  initSentry();
  if (!sentryInstance) return undefined;
  try {
    const eventId = sentryInstance.captureException(error);
    return eventId;
  } catch {
    return undefined;
  }
}




