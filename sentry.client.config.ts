import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 1.0 : 1.0,

  // Enable performance monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Capture user interactions for debugging
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Performance monitoring settings
  beforeSend(event) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development' && event.exception) {
      console.log('Sentry event:', event);
    }
    return event;
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // Environment configuration
  environment: process.env.NODE_ENV,

  // Release tracking
  release: process.env.npm_package_version,
});
