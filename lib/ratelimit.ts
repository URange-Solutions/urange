type Entry = {
  count: number;
  reset: number;
};

const store = new Map<string, Entry>();

export function rateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
) {
  const now = Date.now();

  const current = store.get(key);

  if (!current || current.reset < now) {
    store.set(key, {
      count: 1,
      reset: now + windowMs,
    });

    return {
      success: true,
      remaining: limit - 1,
    };
  }

  if (current.count >= limit) {
    return {
      success: false,
      retryAfter: Math.ceil((current.reset - now) / 1000),
    };
  }

  current.count++;

  return {
    success: true,
    remaining: limit - current.count,
  };
}