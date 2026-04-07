import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("Missing REDIS_URL environment variable");
}

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
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
  user: 60 * 5,
  media: 60 * 10,
  progress: 60 * 2,
  subscription: 60 * 15,
  packages: 60 * 60,
  long: 60 * 60 * 24,
} as const;

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await redis.get(key);
  if (cached !== null) return JSON.parse(cached) as T;

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), "EX", ttl);
  return fresh;
}

export async function invalidateCache(key: string) {
  await redis.del(key);
}

export async function invalidateUserCache(userId: string) {
  const keys = [
    CACHE_KEYS.user(userId),
    CACHE_KEYS.userMedia(userId),
    CACHE_KEYS.subscription(userId),
  ];
  await Promise.all(keys.map((key) => redis.del(key)));
}
