import { Redis } from "@upstash/redis";

function stripQuotes(value?: string) {
  if (typeof value !== "string") return value;
  return value.replace(/^['"]|['"]$/g, "");
}

const rawKvUrl = process.env.KV_REST_API_URL;
const rawKvToken = process.env.KV_REST_API_TOKEN;

const KV_REST_API_URL = stripQuotes(rawKvUrl);
const KV_REST_API_TOKEN = stripQuotes(rawKvToken);

if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
  throw new Error(
    `Missing Upstash KV config. KV_REST_API_URL=${String(
      rawKvUrl
    )}, KV_REST_API_TOKEN=${String(rawKvToken)}`
  );
}

export const redis = new Redis({
  url: KV_REST_API_URL,
  token: KV_REST_API_TOKEN,
});

// Cache keys
export const CACHE_KEYS = {
  user: (id: string) => `user:${id}`,
  userMedia: (userId: string) => `user:${userId}:media`,
  userProgress: (userId: string, subjectId: string) =>
    `user:${userId}:progress:${subjectId}`,
  subscription: (userId: string) => `user:${userId}:subscription`,
  packages: () => "packages:all",
  videoQuiz: (mediaId: string) => `quiz:${mediaId}`,
} as const;

// Cache durations in seconds
export const CACHE_TTL = {
  user: 60 * 5, // 5 minutes
  media: 60 * 10, // 10 minutes
  progress: 60 * 2, // 2 minutes
  subscription: 60 * 15, // 15 minutes
  packages: 60 * 60, // 1 hour
  long: 60 * 60 * 24, // 24 hours
} as const;

// Generic cache helper
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();
  await redis.set(key, fresh, { ex: ttl });
  return fresh;
}

// Invalidate cache
export async function invalidateCache(key: string) {
  await redis.del(key);
}

// Invalidate multiple keys with pattern
export async function invalidateUserCache(userId: string) {
  const keys = [
    CACHE_KEYS.user(userId),
    CACHE_KEYS.userMedia(userId),
    CACHE_KEYS.subscription(userId),
  ];
  await Promise.all(keys.map((key) => redis.del(key)));
}

