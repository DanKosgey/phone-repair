// Performance monitoring utilities

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]>;
  
  private constructor() {
    this.metrics = new Map();
  }
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Start timing a operation
  start(name: string): string {
    const id = `${name}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    performance.mark(`${id}-start`);
    return id;
  }
  
  // End timing and record the metric
  end(id: string): number {
    const [name] = id.split('-');
    performance.mark(`${id}-end`);
    const measure = performance.measure(id, `${id}-start`, `${id}-end`);
    const duration = measure.duration;
    
    // Store metric for averaging
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }
  
  // Get average timing for a metric
  getAverage(name: string): number {
    const timings = this.metrics.get(name);
    if (!timings || timings.length === 0) return 0;
    
    const sum = timings.reduce((acc, curr) => acc + curr, 0);
    return sum / timings.length;
  }
  
  // Get all metrics
  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    for (const [name, timings] of this.metrics.entries()) {
      const sum = timings.reduce((acc, curr) => acc + curr, 0);
      result[name] = {
        average: sum / timings.length,
        count: timings.length
      };
    }
    
    return result;
  }
  
  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }
}

// Utility function to wrap async operations with timing
export async function withTiming<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const monitor = PerformanceMonitor.getInstance();
  const id = monitor.start(name);
  try {
    const result = await fn();
    monitor.end(id);
    return result;
  } catch (error) {
    monitor.end(id);
    throw error;
  }
}

// Utility function to wrap sync operations with timing
export function withTimingSync<T>(name: string, fn: () => T): T {
  const monitor = PerformanceMonitor.getInstance();
  const id = monitor.start(name);
  try {
    const result = fn();
    monitor.end(id);
    return result;
  } catch (error) {
    monitor.end(id);
    throw error;
  }
}