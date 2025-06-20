require('@testing-library/jest-dom');

process.env.POLYGON_API_KEY = 'test-api-key';
process.env.NEXT_PUBLIC_SENTRY_DSN = 'test-sentry-dsn';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// @ts-ignore
// Mock ResizeObserver
globalThis.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// @ts-ignore
// Mock IntersectionObserver
globalThis.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Fail tests on unhandled promise rejections for better debugging
process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('UNHANDLED PROMISE REJECTION:', reason);
  throw reason;
});
