from flask import Flask, render_template, jsonify
import pandas as pd
import json
import os
from datetime import datetime
from src.data_collector import DataCollector
import numpy as np

app = Flask(__name__)

# Initialize the data collector
collector = DataCollector()

# Custom JSON encoder to handle NaN values
class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.float64) and np.isnan(obj):
            return None
        return super().default(obj)

app.json_encoder = CustomJSONEncoder

@app.route('/')
def index():
    """Render the main page."""
    return render_template('index.html')

@app.route('/api/stocks')
def get_stocks():
    """Get the list of available stocks."""
    results_file = os.path.join('data', 'results', 'short_squeeze_scores.csv')
    if os.path.exists(results_file):
        df = pd.read_csv(results_file)
        return jsonify(df.to_dict('records'))
    return jsonify([])

@app.route('/api/stock/<ticker>')
def get_stock_data(ticker):
    """Get data for a specific stock."""
    print(f"\nDebug - API request for {ticker}")
    cache_file = os.path.join('data', 'cache', 'stock_data.json')
    print(f"Cache file path: {cache_file}")
    print(f"Cache file exists: {os.path.exists(cache_file)}")
    
    if os.path.exists(cache_file):
        try:
            with open(cache_file, 'r') as f:
                cache_data = json.load(f)
                print(f"Cache data keys: {cache_data.keys()}")
                print(f"Requested ticker in cache: {ticker in cache_data}")
                
                if ticker in cache_data:
                    # Convert NaN values to None before sending
                    stock_data = cache_data[ticker]
                    print(f"Stock data type: {type(stock_data)}")
                    print(f"Stock data keys: {stock_data.keys() if isinstance(stock_data, dict) else 'Not a dict'}")
                    
                    if isinstance(stock_data['data'], dict):
                        for record in stock_data['data']['data']:
                            for key, value in record.items():
                                if isinstance(value, float) and np.isnan(value):
                                    record[key] = None
                    return jsonify(stock_data)
                else:
                    print(f"Ticker {ticker} not found in cache")
        except Exception as e:
            print(f"Error reading cache file: {str(e)}")
            return jsonify({'error': str(e)}), 500
    else:
        print("Cache file does not exist")
    
    return jsonify(None)

@app.route('/api/update')
def update_data():
    """Update the stock data."""
    try:
        collector.run()
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)})

if __name__ == '__main__':
    # Ensure the data directories exist
    os.makedirs('data/cache', exist_ok=True)
    os.makedirs('data/results', exist_ok=True)
    
    # Run the Flask app with host set to 0.0.0.0 to allow external access
    app.run(host='0.0.0.0', port=8080, debug=True) 