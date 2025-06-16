'use client';

import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Loading({ className, size = 'md' }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        className,
      )}
    />
  );
}

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
}

export function LoadingSkeleton({ className, count = 1 }: LoadingSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={cn('animate-pulse rounded-lg bg-muted', className)} />
      ))}
    </>
  );
}

interface LoadingCardProps {
  variant?: 'compact' | 'detailed';
}

export function LoadingCard({ variant = 'compact' }: LoadingCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <LoadingSkeleton className="h-6 w-24" />
          <LoadingSkeleton className="h-4 w-32" />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton className="h-6 w-20" />
          <LoadingSkeleton className="h-4 w-16" />
        </div>
      </div>

      <div className="mt-4">
        <LoadingSkeleton className="h-10 w-full" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-6 w-24" />
        </div>
        <div className="space-y-2">
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-6 w-28" />
        </div>
      </div>

      {variant === 'detailed' && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-6 w-16" />
            </div>
            <div className="space-y-2">
              <LoadingSkeleton className="h-4 w-20" />
              <LoadingSkeleton className="h-6 w-24" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <LoadingSkeleton className="h-4 w-16" />
            <LoadingSkeleton className="h-6 w-32" />
          </div>
          <div className="mt-2 space-y-2">
            <LoadingSkeleton className="h-4 w-20" />
            <LoadingSkeleton className="h-6 w-36" />
          </div>
        </>
      )}
    </div>
  );
}
