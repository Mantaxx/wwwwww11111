'use client';

import { monitoring } from '@/lib/monitoring';
import { useEffect, useRef } from 'react';

/**
 * Hook do śledzenia wydajności komponentu React
 *
 * @param componentName Nazwa komponentu do śledzenia
 * @param metadata Dodatkowe metadane do zapisania wraz z metryką
 */
export function usePerformanceTracking(componentName: string, metadata?: Record<string, unknown>) {
  const mountTime = useRef<number>(Date.now());
  const renderCount = useRef<number>(0);

  // Śledzenie czasu montowania komponentu
  useEffect(() => {
    // Komponent został zamontowany
    const mountDuration = Date.now() - mountTime.current;

    monitoring.trackPerformance(`component_mount:${componentName}`, mountDuration, metadata);

    // Śledzenie czasu życia komponentu po odmontowaniu
    return () => {
      const lifespanDuration = Date.now() - mountTime.current;
      monitoring.trackPerformance(`component_lifespan:${componentName}`, lifespanDuration, {
        ...metadata,
        renderCount: renderCount.current,
      });
    };
  }, [componentName, metadata]);

  // Zwiększ licznik renderowań
  renderCount.current++;

  return {
    trackAction: (actionName: string, duration?: number) => {
      monitoring.trackPerformance(
        `component_action:${componentName}:${actionName}`,
        duration || 0,
        {
          ...metadata,
          renderCount: renderCount.current,
        }
      );
    },
    trackEvent: (eventName: string, value: number = 1) => {
      monitoring.trackBusinessMetric(
        `component_event:${componentName}:${eventName}`,
        value,
        metadata as Record<string, string>
      );
    },
    renderCount: renderCount.current,
  };
}
