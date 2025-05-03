import pandas as pd
import yfinance as yf
import schedule
import time
from datetime import datetime
import json
import os
import sys
from pathlib import Path

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from config.settings import *
from src.utils import *

class DataCollector:
    def __init__(self):
        self.ensure_directories()
        self.stock_universe = self.load_stock_universe()
        self.cache_file = os.path.join(CACHE_DIR, 'stock_data.json')
        self.results_file = os.path.join(RESULTS_DIR, 'short_squeeze_scores.csv')
        
    def ensure_directories(self):
        """Ensure all required directories exist."""
        for directory in [DATA_DIR, CACHE_DIR, RESULTS_DIR]:
            os.makedirs(directory, exist_ok=True)
    
    def load_stock_universe(self):
        """Load the list of stocks to monitor."""
        # This is a placeholder - in a real application, you might want to:
        # 1. Load from a file
        # 2. Fetch from an API
        # 3. Use a predefined list
        return ['GME', 'AMC', 'KOSS', 'NOK']  # Example stocks
    
    def fetch_stock_data(self, ticker):
        """Fetch comprehensive stock data including short interest."""
        try:
            stock = yf.Ticker(ticker)
            
            # Get basic stock info
            info = stock.info
            
            # Get historical data
            hist = stock.history(period='1mo')
            
            if hist.empty:
                return None
            
            # Calculate technical indicators
            hist = calculate_technical_indicators(hist)
            
            # Get short interest data
            short_interest = info.get('shortPercentOfFloat', 0)
            float_shares = info.get('floatShares', 0)
            
            # Convert DataFrame to a serializable format
            data_dict = {
                'data': hist.to_dict('records'),  # Convert to list of dicts
                'index': hist.index.strftime('%Y-%m-%d %H:%M:%S').tolist(),  # Convert index to strings
                'columns': hist.columns.tolist()  # Store column names
            }
            
            # Debug print
            print(f"\nDebug - Data for {ticker}:")
            print(f"Data type: {type(data_dict)}")
            print(f"Data keys: {data_dict.keys()}")
            print(f"Data sample: {data_dict['data'][0] if data_dict['data'] else 'No data'}")
            
            stock_data = {
                'ticker': ticker,
                'data': data_dict,
                'short_interest': short_interest,
                'float_shares': float_shares,
                'last_updated': datetime.now().isoformat()
            }
            
            # Verify the data structure before returning
            if not isinstance(stock_data['data'], dict):
                print(f"Warning: Data for {ticker} is not a dictionary")
                return None
            
            return stock_data
        except Exception as e:
            print(f"Error fetching data for {ticker}: {str(e)}")
            return None
    
    def process_stock_data(self, stock_data):
        """Process stock data and calculate short squeeze metrics."""
        if not stock_data:
            return None
        
        ticker = stock_data['ticker']
        data_dict = stock_data['data']
        short_interest = stock_data['short_interest']
        float_shares = stock_data['float_shares']
        
        try:
            # Reconstruct the DataFrame
            hist = pd.DataFrame(
                data_dict['data'],
                columns=data_dict['columns']
            )
            hist.index = pd.to_datetime(data_dict['index'])
            
            # Calculate metrics
            current_volume = hist['Volume'].iloc[-1]
            avg_volume = hist['Volume'].mean()
            volume_spike = current_volume / avg_volume
            
            price_change = (hist['Close'].iloc[-1] - hist['Close'].iloc[-PRICE_MOMENTUM_DAYS]) / hist['Close'].iloc[-PRICE_MOMENTUM_DAYS]
            
            days_to_cover = (short_interest * float_shares) / avg_volume
            
            metrics = {
                'ticker': ticker,
                'short_interest': short_interest,
                'days_to_cover': days_to_cover,
                'volume_spike': volume_spike,
                'price_change': price_change,
                'rsi': hist['RSI'].iloc[-1],
                'score': calculate_short_squeeze_score(hist, short_interest, float_shares)
            }
            
            return metrics
        except Exception as e:
            print(f"Error processing data for {ticker}: {str(e)}")
            return None
    
    def update_cache(self):
        """Update the cache with latest stock data."""
        cache_data = {}
        for ticker in self.stock_universe:
            stock_data = self.fetch_stock_data(ticker)
            if stock_data:
                # Debug print before saving
                print(f"\nDebug - Before saving to cache for {ticker}:")
                print(f"Stock data type: {type(stock_data)}")
                print(f"Data field type: {type(stock_data['data'])}")
                print(f"Data field content type: {type(stock_data['data']['data'])}")
                print(f"Data field content sample: {stock_data['data']['data'][0] if stock_data['data']['data'] else 'No data'}")
                
                # Verify the data structure
                if not isinstance(stock_data['data'], dict):
                    print(f"Warning: Data for {ticker} is not a dictionary")
                    continue
                    
                if not isinstance(stock_data['data']['data'], list):
                    print(f"Warning: Data content for {ticker} is not a list")
                    continue
                
                cache_data[ticker] = stock_data
        
        # Save to cache file
        with open(self.cache_file, 'w') as f:
            json.dump(cache_data, f, default=str)
        
        # Verify the data was saved correctly
        with open(self.cache_file, 'r') as f:
            loaded_data = json.load(f)
            print("\nCache verification:")
            print(f"Loaded data type: {type(loaded_data)}")
            if ticker in loaded_data:
                print(f"Data type for {ticker}: {type(loaded_data[ticker]['data'])}")
                print(f"Data content type: {type(loaded_data[ticker]['data']['data'])}")
                print(f"Data content sample: {loaded_data[ticker]['data']['data'][0] if loaded_data[ticker]['data']['data'] else 'No data'}")
    
    def update_results(self):
        """Update the results file with latest short squeeze scores."""
        results = []
        for ticker in self.stock_universe:
            stock_data = self.fetch_stock_data(ticker)
            if stock_data:
                metrics = self.process_stock_data(stock_data)
                if metrics:
                    results.append(metrics)
        
        df = pd.DataFrame(results)
        if not df.empty:
            df.to_csv(self.results_file, index=False)
    
    def run(self):
        """Run the data collection process."""
        print("Starting data collection...")
        self.update_cache()
        self.update_results()
        print("Data collection complete.")

def main():
    collector = DataCollector()
    
    # Schedule updates
    schedule.every(UPDATE_INTERVAL).seconds.do(collector.run)
    
    # Run immediately
    collector.run()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main() 