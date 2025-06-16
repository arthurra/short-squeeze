# Penny Stock Insights Dashboard

A real-time dashboard for tracking and analyzing penny stocks with short squeeze potential. Built with Next.js 14, TypeScript, and modern web technologies.

## Features

- Real-time penny stock monitoring
- Short squeeze signal detection
- Advanced filtering and sorting
- Mobile-first responsive design
- Dark/light mode support
- Real-time data updates

## Tech Stack

- **Framework:** Next.js 14 with TypeScript
- **Styling:** Tailwind CSS with shadcn/ui
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Caching:** Vercel KV
- **Testing:** Jest, React Testing Library, Cypress
- **Error Tracking:** Sentry
- **Code Quality:** ESLint, Prettier, Husky

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm 9.0 or later
- Vercel account (for deployment)
- Sentry account (for error tracking)

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd short-squeeze
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables in `.env.local`:

   - `KV_URL`: Vercel KV database URL
   - `KV_REST_API_URL`: Vercel KV REST API URL
   - `KV_REST_API_TOKEN`: Vercel KV API token
   - `KV_REST_API_READ_ONLY_TOKEN`: Vercel KV read-only token
   - `YAHOO_FINANCE_API_KEY`: Yahoo Finance API key
   - `POLYGON_API_KEY`: Polygon.io API key
   - `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking

4. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier
- `npm test`: Run unit tests
- `npm run test:e2e`: Run E2E tests with Cypress

### Code Style

- We use ESLint and Prettier for code formatting
- Pre-commit hooks are configured with Husky
- Follow the TypeScript strict mode guidelines
- Write tests for all new features

### Testing

- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Component tests: `npm run test:components`

### Error Tracking

- Sentry is configured for error tracking
- Client and server-side errors are automatically captured
- Error boundaries are implemented for graceful error handling

## Deployment

The project is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
