import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
import json
import os
from pathlib import Path
import time

class DataCollector:
    def __init__(self):
        self.cache_dir = 'data/cache'
        self.cache_file = os.path.join(self.cache_dir, 'stock_data.json')
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Define stock symbols
        self.stocks = ['AMC', 'GME', 'KOSS', 'NOK']
        
    def fetch_stock_data(self, ticker):
        """Fetch stock data for a single ticker."""
        print(f"\nFetching data for {ticker}...")
        
        try:
            # Create Ticker object
            stock = yf.Ticker(ticker)
            
            # Add a small delay to avoid rate limiting
            time.sleep(1)
            
            # Set end date to yesterday
            end_date = datetime.today() - timedelta(days=1)
            start_date = end_date - timedelta(days=120)  # 6 months of data
            
            print(f"Fetching data from {start_date.date()} to {end_date.date()} (end is exclusive)")
            hist = stock.history(
                start=start_date.strftime('%Y-%m-%d'),
                end=end_date.strftime('%Y-%m-%d'),
                interval='1d',
                prepost=False  # Only get regular trading hours data
            )
            
            if hist.empty:
                print(f"Warning: No historical data found for {ticker}")
                return None
                
            print(f"Successfully fetched {len(hist)} days of data for {ticker}")
            print(f"Date range: {hist.index[0].date()} to {hist.index[-1].date()}")
            
            # Get basic stock info
            try:
                info = stock.info
                short_interest = info.get('shortPercentOfFloat', 0)
                float_shares = info.get('floatShares', 0)
                print(f"Short Interest: {short_interest:.2%}")
                print(f"Float Shares: {float_shares:,}")
            except Exception as e:
                print(f"Warning: Could not fetch stock info: {str(e)}")
                short_interest = 0
                float_shares = 0
            
            # Prepare data for storage
            stock_data = {
                'ticker': ticker,
                'data': {
                    'data': hist.to_dict('records'),
                    'index': hist.index.strftime('%Y-%m-%d').tolist(),
                    'columns': hist.columns.tolist()
                },
                'short_interest': short_interest,
                'float_shares': float_shares,
                'last_updated': datetime.now().isoformat()
            }
            
            return stock_data
            
        except Exception as e:
            print(f"Error fetching data for {ticker}: {str(e)}")
            return None
    
    def collect_data(self):
        """Collect data for AMC and GME."""
        print("Starting data collection...")
        
        # Collect data for each stock
        data = {}
        for ticker in self.stocks:
            stock_data = self.fetch_stock_data(ticker)
            if stock_data:
                data[ticker] = stock_data
                print(f"Successfully collected data for {ticker}")
            else:
                print(f"Failed to collect data for {ticker}")
        
        # Save to cache
        if data:
            print("\nSaving data to cache...")
            with open(self.cache_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"Data saved to {self.cache_file}")
            
            # Verify the data was saved correctly
            with open(self.cache_file, 'r') as f:
                loaded_data = json.load(f)
                print("\nCache verification:")
                print(f"Loaded data type: {type(loaded_data)}")
                for ticker in loaded_data:
                    print(f"\nData for {ticker}:")
                    print(f"Number of days: {len(loaded_data[ticker]['data']['data'])}")
                    print(f"Date range: {loaded_data[ticker]['data']['index'][0]} to {loaded_data[ticker]['data']['index'][-1]}")
        else:
            print("\nNo data collected to save")
        
        print("\nData collection complete.")

def main():
    collector = DataCollector()
    collector.collect_data()

if __name__ == "__main__":
    main() 