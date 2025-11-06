'use client';

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function usePerformanceMonitor(componentName: string) {
  const metricsRef = useRef<PerformanceMetrics>({});
  
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }
    
    // Measure First Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            metricsRef.current.fcp = entry.startTime;
            console.log(`[${componentName}] First Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
          }
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
      
      return () => {
        observer.disconnect();
      };
    }
  }, [componentName]);
  
  // Function to manually log custom metrics
  const logMetric = (metricName: string, value: number) => {
    console.log(`[${componentName}] ${metricName}: ${value.toFixed(2)}ms`);
  };
  
  return { logMetric };
}