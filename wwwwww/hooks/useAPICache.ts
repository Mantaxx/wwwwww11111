'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  staleWhileRevalidate?: boolean; // Serve stale data while revalidating
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private config: Required<CacheConfig>;
  private pendingRequests = new Map<string, Promise<any>>();

  constructor(config: CacheConfig = {}) {
    this.config = {
      ttl: config.ttl || 5 * 60 * 1000, // 5 minutes default
      maxSize: config.maxSize || 100,
      staleWhileRevalidate: config.staleWhileRevalidate || true,
    };
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private isStale(entry: CacheEntry<any>): boolean {
    return Date.now() > entry.timestamp + this.config.ttl * 0.8; // 80% of TTL
  }

  private evictOldEntries(): void {
    if (this.cache.size <= this.config.maxSize) return;

    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toDelete = entries.slice(0, entries.length - this.config.maxSize);
    toDelete.forEach(([key]) => this.cache.delete(key));
  }

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const entry = this.cache.get(key);

    // Return fresh data
    if (entry && !this.isExpired(entry)) {
      return entry.data;
    }

    // Return stale data while revalidating
    if (entry && this.isStale(entry) && this.config.staleWhileRevalidate) {
      // Start revalidation in background
      this.revalidate(key, fetcher);
      return entry.data;
    }

    // Fetch new data
    return this.fetchAndCache(key, fetcher);
  }

  private async fetchAndCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Check if request is already pending
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    const promise = fetcher()
      .then(data => {
        this.set(key, data);
        this.pendingRequests.delete(key);
        return data;
      })
      .catch(error => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, promise);
    return promise;
  }

  private async revalidate<T>(key: string, fetcher: () => Promise<T>): Promise<void> {
    try {
      const data = await fetcher();
      this.set(key, data);
    } catch (error) {
      console.warn(`Failed to revalidate cache for key: ${key}`, error);
    }
  }

  set<T>(key: string, data: T): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + this.config.ttl,
    });
    this.evictOldEntries();
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      fresh: entries.filter(e => !this.isExpired(e)).length,
      stale: entries.filter(e => this.isStale(e) && !this.isExpired(e)).length,
      expired: entries.filter(e => this.isExpired(e)).length,
      pendingRequests: this.pendingRequests.size,
    };
  }
}

// Global cache instance
const globalCache = new APICache({
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 200,
  staleWhileRevalidate: true,
});

/**
 * Hook do cacheowania API calls
 */
export function useAPICache<T>(key: string, fetcher: () => Promise<T>, config?: CacheConfig) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef(config ? new APICache(config) : globalCache);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await cache.current.get(key, fetcher);
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, cache]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    cache.current.delete(key);
    fetchData();
  }, [key, fetchData]);

  const invalidate = useCallback(() => {
    cache.current.delete(key);
  }, [key]);

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
  };
}

/**
 * Hook do cacheowania obrazów
 */
export function useImageCache(src: string, config?: CacheConfig) {
  const cache = useRef(config ? new APICache(config) : globalCache);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const loadImage = async () => {
      try {
        await cache.current.get(`image:${src}`, async () => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = reject;
            img.src = src;
          });
        });
        setIsLoaded(true);
        setIsError(false);
      } catch (error) {
        setIsError(true);
        setIsLoaded(false);
      }
    };

    loadImage();
  }, [src, cache]);

  return { isLoaded, isError };
}

/**
 * Hook do batch cacheowania
 */
export function useBatchAPICache<T>(
  keys: string[],
  fetcher: (key: string) => Promise<T>,
  config?: CacheConfig
) {
  const [data, setData] = useState<Record<string, T>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const cache = useRef(config ? new APICache(config) : globalCache);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const promises = keys.map(async key => {
        const result = await cache.current.get(key, () => fetcher(key));
        return { key, result };
      });

      const results = await Promise.all(promises);
      const dataMap = results.reduce(
        (acc, { key, result }) => {
          acc[key] = result;
          return acc;
        },
        {} as Record<string, T>
      );

      setData(dataMap);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [keys, fetcher, cache]);

  useEffect(() => {
    if (keys.length > 0) {
      fetchAll();
    }
  }, [fetchAll]);

  const refetch = useCallback(() => {
    keys.forEach(key => cache.current.delete(key));
    fetchAll();
  }, [keys, fetchAll]);

  const invalidate = useCallback(
    (key?: string) => {
      if (key) {
        cache.current.delete(key);
      } else {
        keys.forEach(k => cache.current.delete(k));
      }
    },
    [keys]
  );

  return {
    data,
    isLoading,
    error,
    refetch,
    invalidate,
  };
}

export { APICache, globalCache };
