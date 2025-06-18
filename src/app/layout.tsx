import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { Providers } from './providers';
import { initializePerformanceMonitoring } from '@/lib/utils/performance';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';

export const metadata: Metadata = {
  title: 'Penny Stock Insights',
  description: 'Real-time penny stock analysis and squeeze signal detection',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize performance monitoring on client side
  if (typeof window !== 'undefined') {
    initializePerformanceMonitoring();
  }

  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>{children}</Providers>
        <PerformanceMonitor />
      </body>
    </html>
  );
}
