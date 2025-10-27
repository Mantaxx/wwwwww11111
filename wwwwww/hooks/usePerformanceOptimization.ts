'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';
import { monitoring } from '@/lib/monitoring';

interface PerformanceConfig {
  enableTracking?: boolean;
  trackRenderTime?: boolean;
  trackMemoryUsage?: boolean;
  debounceMs?: number;
}

/**
 * Hook do optymalizacji wydajności komponentów React
 */
export function usePerformanceOptimization(componentName: string, config: PerformanceConfig = {}) {
  const {
    enableTracking = true,
    trackRenderTime = true,
    trackMemoryUsage = false,
    debounceMs = 100,
  } = config;

  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());
  const debounceTimeout = useRef<NodeJS.Timeout>();

  // Śledzenie renderów
  useEffect(() => {
    renderCount.current++;
    const currentTime = Date.now();
    const renderDuration = currentTime - lastRenderTime.current;

    if (enableTracking && trackRenderTime) {
      monitoring.trackPerformance(`component_render:${componentName}`, renderDuration, {
        renderCount: renderCount.current,
        componentName,
      });
    }

    lastRenderTime.current = currentTime;
  });

  // Śledzenie czasu życia komponentu
  useEffect(() => {
    mountTime.current = Date.now();

    return () => {
      const lifespan = Date.now() - mountTime.current;
      if (enableTracking) {
        monitoring.trackPerformance(`component_lifespan:${componentName}`, lifespan, {
          renderCount: renderCount.current,
          componentName,
        });
      }
    };
  }, [componentName, enableTracking]);

  // Śledzenie użycia pamięci (jeśli dostępne)
  useEffect(() => {
    if (enableTracking && trackMemoryUsage && 'memory' in performance) {
      const memory = (performance as any).memory;
      if (memory) {
        monitoring.trackMetric('memory_usage', memory.usedJSHeapSize, {
          component: componentName,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }
    }
  }, [componentName, enableTracking, trackMemoryUsage]);

  // Debounced callback
  const debouncedCallback = useCallback(
    (callback: () => void) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(callback, debounceMs);
    },
    [debounceMs]
  );

  // Memoized value getter
  const memoizedValue = useCallback(<T>(value: T, deps: React.DependencyList): T => {
    return useMemo(() => value, deps);
  }, []);

  return {
    renderCount: renderCount.current,
    debouncedCallback,
    memoizedValue,
    trackAction: (actionName: string, duration?: number) => {
      if (enableTracking) {
        monitoring.trackPerformance(
          `component_action:${componentName}:${actionName}`,
          duration || 0,
          {
            renderCount: renderCount.current,
            componentName,
          }
        );
      }
    },
    trackEvent: (eventName: string, value: number = 1) => {
      if (enableTracking) {
        monitoring.trackBusinessMetric(`component_event:${componentName}:${eventName}`, value, {
          component: componentName,
        });
      }
    },
  };
}

/**
 * Hook do optymalizacji list i dużych zbiorów danych
 */
export function useListOptimization<T>(
  items: T[],
  options: {
    pageSize?: number;
    virtualScrolling?: boolean;
    preloadCount?: number;
  } = {}
) {
  const { pageSize = 20, virtualScrolling = false, preloadCount = 5 } = options;

  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Paginacja
  const paginatedItems = useMemo(() => {
    if (!virtualScrolling) {
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return items.slice(startIndex, endIndex);
    }
    return items;
  }, [items, currentPage, pageSize, virtualScrolling]);

  // Preload następnych elementów
  const preloadItems = useMemo(() => {
    if (virtualScrolling) return [];
    const startIndex = currentPage * pageSize;
    const endIndex = startIndex + preloadCount;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, pageSize, preloadCount, virtualScrolling]);

  const totalPages = Math.ceil(items.length / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const loadNextPage = useCallback(async () => {
    if (!hasNextPage || isLoading) return;

    setIsLoading(true);
    // Symuluj opóźnienie ładowania
    await new Promise(resolve => setTimeout(resolve, 100));
    setCurrentPage(prev => prev + 1);
    setIsLoading(false);
  }, [hasNextPage, isLoading]);

  const loadPrevPage = useCallback(async () => {
    if (!hasPrevPage || isLoading) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 100));
    setCurrentPage(prev => prev - 1);
    setIsLoading(false);
  }, [hasPrevPage, isLoading]);

  return {
    paginatedItems,
    preloadItems,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    isLoading,
    loadNextPage,
    loadPrevPage,
    setCurrentPage,
  };
}

/**
 * Hook do optymalizacji obrazów
 */
export function useImageOptimization(
  src: string,
  options: {
    preload?: boolean;
    lazy?: boolean;
    quality?: number;
  } = {}
) {
  const { preload = false, lazy = true, quality = 85 } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy);

  // Preload obrazu
  useEffect(() => {
    if (!preload || !src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setIsError(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, preload]);

  // Generuj optymalizowane URL
  const optimizedSrc = useMemo(() => {
    if (!src) return src;

    const params = new URLSearchParams();
    if (quality !== 85) params.set('q', quality.toString());

    const queryString = params.toString();
    return queryString ? `${src}?${queryString}` : src;
  }, [src, quality]);

  return {
    optimizedSrc,
    isLoaded,
    isError,
    isInView,
    setIsInView,
  };
}
