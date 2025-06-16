import { kv } from '@vercel/kv';

export async function getCachedData<T>(key: string): Promise<T | null> {
  return kv.get<T>(key);
}

export async function setCachedData<T>(key: string, value: T, ttl?: number): Promise<void> {
  if (ttl) {
    await kv.set(key, value, { ex: ttl });
  } else {
    await kv.set(key, value);
  }
}
