import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import yfinance as yf
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from config.settings import *

def ensure_directories():
    """Ensure all required directories exist."""
    for directory in [DATA_DIR, CACHE_DIR, RESULTS_DIR]:
        os.makedirs(directory, exist_ok=True)

def get_stock_data(ticker, period='3mo'):
    """Fetch stock data from Yahoo Finance."""
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        return hist
    except Exception as e:
        print(f"Error fetching data for {ticker}: {str(e)}")
        return None

def calculate_technical_indicators(df):
    """Calculate technical indicators for the given DataFrame."""
    if df is None or df.empty:
        return None
    
    # Calculate RSI
    delta = df['Close'].diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
    rs = gain / loss
    df['RSI'] = 100 - (100 / (1 + rs))
    
    # Calculate Moving Averages
    df['MA5'] = df['Close'].rolling(window=5).mean()
    df['MA20'] = df['Close'].rolling(window=20).mean()
    
    # Calculate Volume MA
    df['Volume_MA'] = df['Volume'].rolling(window=20).mean()
    
    return df

def calculate_short_squeeze_score(stock_data, short_interest, float_shares):
    """Calculate a short squeeze score based on various factors."""
    if stock_data is None or stock_data.empty:
        return 0.0
    
    score = 0.0
    weights = {
        'short_interest': 0.3,
        'volume_spike': 0.2,
        'price_momentum': 0.2,
        'rsi': 0.15,
        'days_to_cover': 0.15
    }
    
    # Short Interest Score
    short_interest_ratio = short_interest / float_shares
    score += weights['short_interest'] * min(short_interest_ratio / SHORT_INTEREST_THRESHOLD, 1.0)
    
    # Volume Spike Score
    current_volume = stock_data['Volume'].iloc[-1]
    avg_volume = stock_data['Volume'].mean()
    volume_ratio = current_volume / avg_volume
    score += weights['volume_spike'] * min(volume_ratio / VOLUME_SPIKE_THRESHOLD, 1.0)
    
    # Price Momentum Score
    price_change = (stock_data['Close'].iloc[-1] - stock_data['Close'].iloc[-PRICE_MOMENTUM_DAYS]) / stock_data['Close'].iloc[-PRICE_MOMENTUM_DAYS]
    score += weights['price_momentum'] * min(max(price_change, 0), 1.0)
    
    # RSI Score
    current_rsi = stock_data['RSI'].iloc[-1]
    if current_rsi < RSI_OVERSOLD_THRESHOLD:
        rsi_score = 1.0
    elif current_rsi > RSI_OVERBOUGHT_THRESHOLD:
        rsi_score = 0.0
    else:
        rsi_score = 1.0 - ((current_rsi - RSI_OVERSOLD_THRESHOLD) / (RSI_OVERBOUGHT_THRESHOLD - RSI_OVERSOLD_THRESHOLD))
    score += weights['rsi'] * rsi_score
    
    # Days to Cover Score
    days_to_cover = short_interest / avg_volume
    score += weights['days_to_cover'] * min(days_to_cover / DAYS_TO_COVER_THRESHOLD, 1.0)
    
    return min(score, 1.0)

def format_alert_message(ticker, score, metrics):
    """Format an alert message with key metrics."""
    message = f"🚨 Short Squeeze Alert for {ticker} 🚨\n\n"
    message += f"Short Squeeze Score: {score:.2f}\n"
    message += f"Short Interest: {metrics['short_interest']:.2%}\n"
    message += f"Days to Cover: {metrics['days_to_cover']:.1f}\n"
    message += f"Volume Spike: {metrics['volume_spike']:.1f}x\n"
    message += f"Price Change (5d): {metrics['price_change']:.2%}\n"
    message += f"RSI: {metrics['rsi']:.1f}\n"
    return message 