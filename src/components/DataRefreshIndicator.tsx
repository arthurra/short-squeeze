'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataRefreshIndicatorProps {
  lastUpdated: number;
  refreshInterval?: number;
  className?: string;
}

export function DataRefreshIndicator({
  lastUpdated,
  refreshInterval = 300000, // 5 minutes
  className,
}: DataRefreshIndicatorProps) {
  const [timeSinceUpdate, setTimeSinceUpdate] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateTimeSinceUpdate = () => {
      const now = Date.now();
      setTimeSinceUpdate(now - lastUpdated);
    };

    // Update immediately
    updateTimeSinceUpdate();

    // Update every second
    const interval = setInterval(updateTimeSinceUpdate, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatTimeAgo = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const needsRefresh = timeSinceUpdate > refreshInterval;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        needsRefresh && 'text-yellow-600',
        className,
      )}
    >
      <RefreshCw
        className={cn('h-4 w-4', isRefreshing && 'animate-spin', needsRefresh && 'text-yellow-600')}
      />
      <span>
        Last updated {formatTimeAgo(timeSinceUpdate)}
        {needsRefresh && ' • Refresh needed'}
      </span>
    </div>
  );
}
