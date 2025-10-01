import type { TRepositoryData } from './types';

const repoDataCache = new Map<string, { data: TRepositoryData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function getFromCache(key: string): TRepositoryData | null {
  const cached = repoDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  if (cached) {
    repoDataCache.delete(key);
  }
  return null;
}

export function setInCache(key: string, data: TRepositoryData): void {
  repoDataCache.set(key, { data, timestamp: Date.now() });
}

export function clearCache(): void {
  repoDataCache.clear();
}