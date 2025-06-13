# Penny Stock Insights Dashboard

A modern web application for tracking and analyzing penny stocks, built with React, TypeScript, and Vite.

## Features

- Real-time stock data from Yahoo Finance and Polygon APIs
- Interactive filtering and search capabilities
- Responsive design for all devices
- Dark/light mode support
- Sparkline charts for price trends

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Yahoo Finance API key
- Polygon API key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/penny-stock-insights-dashboard.git
   cd penny-stock-insights-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Create a `.env` file in the root directory with your API keys:

   ```
   VITE_YAHOO_FINANCE_API_KEY=your_yahoo_finance_api_key_here
   VITE_POLYGON_API_KEY=your_polygon_api_key_here
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
