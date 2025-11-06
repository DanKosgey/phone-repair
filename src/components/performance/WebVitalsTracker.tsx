'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { useEffect } from 'react';

export function WebVitalsTracker() {
  useReportWebVitals((metric) => {
    // In development, log metrics to the console
    if (process.env.NODE_ENV === 'development') {
      console.log(metric);
    }
    
    // In production, send metrics to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Google Analytics, Sentry, or custom analytics endpoint
      // gtag('event', metric.name, {
      //   value: Math.round(metric.value * 100) / 100,
      //   event_label: metric.id,
      //   non_interaction: true,
      // });
      
      // Or send to a custom endpoint
      // fetch('/api/web-vitals', {
      //   method: 'POST',
      //   body: JSON.stringify(metric),
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });
    }
  });

  return null;
}