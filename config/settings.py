import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API Keys
YAHOO_API_KEY = os.getenv('YAHOO_API_KEY')
NEWS_API_KEY = os.getenv('NEWS_API_KEY')

# Short Squeeze Criteria Thresholds
SHORT_INTEREST_THRESHOLD = 0.20  # 20% of float
DAYS_TO_COVER_THRESHOLD = 5      # 5 days to cover
VOLUME_SPIKE_THRESHOLD = 2.0     # 2x average volume
PRICE_MOMENTUM_DAYS = 5          # Look back 5 days for momentum
RSI_OVERSOLD_THRESHOLD = 30      # RSI below 30 considered oversold
RSI_OVERBOUGHT_THRESHOLD = 70    # RSI above 70 considered overbought

# Data Collection Settings
UPDATE_INTERVAL = 300  # 5 minutes in seconds
HISTORICAL_DAYS = 30   # Number of days of historical data to collect

# Stock Universe Settings
MIN_PRICE = 0.01      # Minimum stock price
MAX_PRICE = 5.00      # Maximum stock price
MIN_VOLUME = 100000   # Minimum daily volume
MIN_MARKET_CAP = 10000000  # Minimum market cap ($10M)

# Dashboard Settings
DASHBOARD_PORT = 8050
DASHBOARD_HOST = '0.0.0.0'

# Alert Settings
ALERT_EMAIL = os.getenv('ALERT_EMAIL')
ALERT_SMS = os.getenv('ALERT_SMS')
ALERT_THRESHOLD = 0.8  # Alert when score exceeds 0.8 (0-1 scale)

# Data Storage
DATA_DIR = 'data'
CACHE_DIR = os.path.join(DATA_DIR, 'cache')
RESULTS_DIR = os.path.join(DATA_DIR, 'results') 