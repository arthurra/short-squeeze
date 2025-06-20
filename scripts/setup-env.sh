#!/bin/bash

# Setup script for Short Squeeze Dashboard
echo "🚀 Setting up Short Squeeze Dashboard environment..."

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Backing up to .env.local.backup"
    cp .env.local .env.local.backup
fi

# Create .env.local file
cat > .env.local << EOF
# Polygon.io API Key (required for real stock data)
# Get your free API key at https://polygon.io/
POLYGON_API_KEY=

# Set to false to use real API data instead of mock data
# Set to true to use mock data (default for development)
USE_MOCK_DATA=true

# API Configuration (optional - these are the defaults)
API_RATE_LIMIT=5
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
CACHE_TTL=300

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

echo "✅ Created .env.local file"

# Ask user if they want to use real API data
echo ""
echo "🤔 Do you want to use real API data instead of mock data?"
echo "   This requires a Polygon.io API key (free tier available)"
read -p "   Use real API data? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📝 Please enter your Polygon.io API key:"
    echo "   Get a free key at: https://polygon.io/"
    read -p "   API Key: " api_key
    
    if [ ! -z "$api_key" ]; then
        # Update .env.local to use real API data
        sed -i '' 's/POLYGON_API_KEY=/POLYGON_API_KEY='"$api_key"'/' .env.local
        sed -i '' 's/USE_MOCK_DATA=true/USE_MOCK_DATA=false/' .env.local
        
        echo "✅ Configured for real API data"
        echo "   - API Key: ${api_key:0:8}..."
        echo "   - USE_MOCK_DATA: false"
    else
        echo "⚠️  No API key provided, keeping mock data configuration"
    fi
else
    echo "✅ Keeping mock data configuration"
    echo "   - USE_MOCK_DATA: true"
    echo "   - No API key required"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm install' to install dependencies"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "To switch between mock and real data later:"
echo "- Edit USE_MOCK_DATA in .env.local"
echo "- Add/remove POLYGON_API_KEY as needed" 