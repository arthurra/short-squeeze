'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PerformanceData {
  LCP?: number;
  FID?: number;
  CLS?: number;
  FCP?: number;
  TTFB?: number;
  pageLoadTime?: number;
  componentRenders: Array<{ name: string; duration: number }>;
  apiCalls: Array<{ url: string; duration: number; status: number }>;
}

export function PerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    componentRenders: [],
    apiCalls: [],
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Listen for performance events
    const handlePerformanceEvent = (event: CustomEvent) => {
      const { type, data } = event.detail;

      setPerformanceData((prev) => {
        switch (type) {
          case 'metric':
            return { ...prev, [data.name]: data.value };
          case 'component-render':
            return {
              ...prev,
              componentRenders: [
                ...prev.componentRenders,
                { name: data.component, duration: data.duration },
              ],
            };
          case 'api-call':
            return {
              ...prev,
              apiCalls: [
                ...prev.apiCalls,
                { url: data.url, duration: data.duration, status: data.status },
              ],
            };
          default:
            return prev;
        }
      });
    };

    window.addEventListener('performance-event', handlePerformanceEvent as EventListener);

    return () => {
      window.removeEventListener('performance-event', handlePerformanceEvent as EventListener);
    };
  }, []);

  if (process.env.NODE_ENV !== 'development') return null;

  const getMetricStatus = (value: number, threshold: number) => {
    if (value <= threshold) return 'good';
    if (value <= threshold * 1.5) return 'needs-improvement';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className="bg-white/95 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Performance Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Core Web Vitals */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-600">Core Web Vitals</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {performanceData.LCP && (
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <Badge className={getStatusColor(getMetricStatus(performanceData.LCP, 2500))}>
                    {performanceData.LCP.toFixed(0)}ms
                  </Badge>
                </div>
              )}
              {performanceData.FID && (
                <div className="flex justify-between">
                  <span>FID:</span>
                  <Badge className={getStatusColor(getMetricStatus(performanceData.FID, 100))}>
                    {performanceData.FID.toFixed(0)}ms
                  </Badge>
                </div>
              )}
              {performanceData.CLS && (
                <div className="flex justify-between">
                  <span>CLS:</span>
                  <Badge className={getStatusColor(getMetricStatus(performanceData.CLS, 0.1))}>
                    {performanceData.CLS.toFixed(3)}
                  </Badge>
                </div>
              )}
              {performanceData.FCP && (
                <div className="flex justify-between">
                  <span>FCP:</span>
                  <Badge className={getStatusColor(getMetricStatus(performanceData.FCP, 1800))}>
                    {performanceData.FCP.toFixed(0)}ms
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Component Renders */}
          {performanceData.componentRenders.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600">Slow Renders</h4>
              <div className="space-y-1">
                {performanceData.componentRenders
                  .filter((render) => render.duration > 50)
                  .slice(-3)
                  .map((render, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{render.name}</span>
                      <span className="text-red-600">{render.duration.toFixed(0)}ms</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* API Calls */}
          {performanceData.apiCalls.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-600">Slow API Calls</h4>
              <div className="space-y-1">
                {performanceData.apiCalls
                  .filter((call) => call.duration > 1000)
                  .slice(-3)
                  .map((call, index) => (
                    <div key={index} className="flex justify-between text-xs">
                      <span className="truncate">{call.url.split('/').pop()}</span>
                      <span className="text-red-600">{call.duration.toFixed(0)}ms</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
