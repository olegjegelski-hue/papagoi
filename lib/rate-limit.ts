type IpKey = string;

interface RateLimitOptions {
  windowMs: number; // time window in ms
  max: number; // max requests per window per IP
  minIntervalMs?: number; // optional minimal interval between requests
}

interface IpState {
  timestamps: number[];
  lastAt?: number;
}

const globalStore = globalThis as unknown as {
  __papagoiRateLimit?: Map<IpKey, IpState>;
};

function getStore(): Map<IpKey, IpState> {
  if (!globalStore.__papagoiRateLimit) {
    globalStore.__papagoiRateLimit = new Map();
  }
  return globalStore.__papagoiRateLimit;
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return '127.0.0.1';
}

export function rateLimit(ip: string, options: RateLimitOptions): { allowed: boolean; remaining: number } {
  const store = getStore();
  const now = Date.now();
  const state = store.get(ip) ?? { timestamps: [] };

  // prune timestamps outside window
  const since = now - options.windowMs;
  state.timestamps = state.timestamps.filter(ts => ts >= since);

  // minimal interval check
  if (options.minIntervalMs && state.lastAt && now - state.lastAt < options.minIntervalMs) {
    store.set(ip, state);
    return { allowed: false, remaining: Math.max(0, options.max - state.timestamps.length) };
  }

  if (state.timestamps.length >= options.max) {
    store.set(ip, state);
    return { allowed: false, remaining: 0 };
  }

  state.timestamps.push(now);
  state.lastAt = now;
  store.set(ip, state);
  return { allowed: true, remaining: Math.max(0, options.max - state.timestamps.length) };
}




