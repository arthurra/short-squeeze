import dash
from dash import dcc, html
from dash.dependencies import Input, Output
import plotly.graph_objects as go
import pandas as pd
import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from config.settings import *
from src.utils import *

# Initialize the Dash app
app = dash.Dash(__name__)

# Define the layout
app.layout = html.Div([
    html.H1("Short Squeeze Tracker", style={'textAlign': 'center'}),
    
    # Top metrics
    html.Div([
        html.Div([
            html.H3("High Probability Short Squeezes"),
            html.Div(id='high-probability-stocks')
        ], className='six columns'),
        
        html.Div([
            html.H3("Recent Alerts"),
            html.Div(id='recent-alerts')
        ], className='six columns')
    ], className='row'),
    
    # Main content
    html.Div([
        # Stock selection
        html.Div([
            html.H3("Select Stock"),
            dcc.Dropdown(id='stock-selector', multi=False)
        ], className='three columns'),
        
        # Stock details
        html.Div([
            html.H3("Stock Details"),
            html.Div(id='stock-details')
        ], className='nine columns')
    ], className='row'),
    
    # Charts
    html.Div([
        html.Div([
            dcc.Graph(id='price-chart')
        ], className='six columns'),
        
        html.Div([
            dcc.Graph(id='volume-chart')
        ], className='six columns')
    ], className='row'),
    
    # Auto-refresh
    dcc.Interval(
        id='interval-component',
        interval=UPDATE_INTERVAL * 1000,  # in milliseconds
        n_intervals=0
    )
])

# Callbacks
@app.callback(
    [Output('stock-selector', 'options'),
     Output('stock-selector', 'value')],
    [Input('interval-component', 'n_intervals')]
)
def update_stock_list(n):
    """Update the list of available stocks."""
    results_file = os.path.join(RESULTS_DIR, 'short_squeeze_scores.csv')
    if os.path.exists(results_file):
        df = pd.read_csv(results_file)
        options = [{'label': ticker, 'value': ticker} for ticker in df['ticker']]
        value = options[0]['value'] if options else None
        return options, value
    return [], None

@app.callback(
    Output('high-probability-stocks', 'children'),
    [Input('interval-component', 'n_intervals')]
)
def update_high_probability_stocks(n):
    """Update the list of high probability short squeeze stocks."""
    results_file = os.path.join(RESULTS_DIR, 'short_squeeze_scores.csv')
    if os.path.exists(results_file):
        df = pd.read_csv(results_file)
        df = df.sort_values('score', ascending=False).head(5)
        
        return html.Table([
            html.Thead(html.Tr([
                html.Th('Ticker'),
                html.Th('Score'),
                html.Th('Short Interest'),
                html.Th('Days to Cover')
            ])),
            html.Tbody([
                html.Tr([
                    html.Td(row['ticker']),
                    html.Td(f"{row['score']:.2f}"),
                    html.Td(f"{row['short_interest']:.2%}"),
                    html.Td(f"{row['days_to_cover']:.1f}")
                ]) for _, row in df.iterrows()
            ])
        ])
    return "No data available"

@app.callback(
    [Output('price-chart', 'figure'),
     Output('volume-chart', 'figure')],
    [Input('stock-selector', 'value')]
)
def update_charts(selected_stock):
    """Update the price and volume charts."""
    if not selected_stock:
        return {}, {}
    
    cache_file = os.path.join(CACHE_DIR, 'stock_data.json')
    if not os.path.exists(cache_file):
        return {}, {}
    
    try:
        with open(cache_file, 'r') as f:
            cache_data = json.load(f)
        
        if selected_stock not in cache_data:
            return {}, {}
        
        stock_data = cache_data[selected_stock]
        
        # Debug print
        print(f"\nDebug - Dashboard data for {selected_stock}:")
        print(f"Stock data type: {type(stock_data)}")
        print(f"Stock data keys: {stock_data.keys()}")
        print(f"Data field type: {type(stock_data['data'])}")
        
        # Handle the data structure
        if isinstance(stock_data['data'], str):
            try:
                # Try to parse the string as JSON
                parsed_data = json.loads(stock_data['data'])
                print(f"Successfully parsed string data: {type(parsed_data)}")
                stock_data['data'] = parsed_data
            except json.JSONDecodeError as e:
                print(f"Failed to parse string data: {str(e)}")
                return {}, {}
        
        if not isinstance(stock_data['data'], dict):
            print(f"Unexpected data type: {type(stock_data['data'])}")
            return {}, {}
            
        # Verify the required keys are present
        required_keys = ['data', 'index', 'columns']
        if not all(key in stock_data['data'] for key in required_keys):
            print(f"Missing required keys in data structure. Found: {stock_data['data'].keys()}")
            return {}, {}
        
        # Verify the data content
        if not isinstance(stock_data['data']['data'], list):
            print(f"Unexpected data content type: {type(stock_data['data']['data'])}")
            return {}, {}
            
        if not stock_data['data']['data']:
            print("No data available")
            return {}, {}
            
        print(f"Data content type: {type(stock_data['data']['data'])}")
        print(f"Data content sample: {stock_data['data']['data'][0]}")
        
        try:
            # Create DataFrame from the stored data
            df = pd.DataFrame(
                stock_data['data']['data'],
                columns=stock_data['data']['columns']
            )
            # Set the index from the stored datetime strings
            df.index = pd.to_datetime(stock_data['data']['index'])
            print(f"\nDataFrame created successfully with shape: {df.shape}")
            print(f"DataFrame columns: {df.columns.tolist()}")
        except Exception as e:
            print(f"Error creating DataFrame: {str(e)}")
            return {}, {}
        
        # Ensure all required columns exist
        required_columns = ['Open', 'High', 'Low', 'Close', 'Volume', 'MA5', 'MA20', 'Volume_MA']
        for col in required_columns:
            if col not in df.columns:
                print(f"Warning: Missing column {col}")
                return {}, {}
        
        # Price chart
        price_fig = go.Figure()
        price_fig.add_trace(go.Candlestick(
            x=df.index,
            open=df['Open'],
            high=df['High'],
            low=df['Low'],
            close=df['Close'],
            name='Price'
        ))
        price_fig.add_trace(go.Scatter(
            x=df.index,
            y=df['MA5'],
            name='MA5',
            line=dict(color='blue')
        ))
        price_fig.add_trace(go.Scatter(
            x=df.index,
            y=df['MA20'],
            name='MA20',
            line=dict(color='orange')
        ))
        price_fig.update_layout(
            title=f'{selected_stock} Price Chart',
            yaxis_title='Price',
            xaxis_title='Date'
        )
        
        # Volume chart
        volume_fig = go.Figure()
        volume_fig.add_trace(go.Bar(
            x=df.index,
            y=df['Volume'],
            name='Volume'
        ))
        volume_fig.add_trace(go.Scatter(
            x=df.index,
            y=df['Volume_MA'],
            name='Volume MA',
            line=dict(color='red')
        ))
        volume_fig.update_layout(
            title=f'{selected_stock} Volume Chart',
            yaxis_title='Volume',
            xaxis_title='Date'
        )
        
        return price_fig, volume_fig
    
    except Exception as e:
        print(f"Error updating charts: {str(e)}")
        import traceback
        traceback.print_exc()
        return {}, {}

@app.callback(
    Output('stock-details', 'children'),
    [Input('stock-selector', 'value')]
)
def update_stock_details(selected_stock):
    """Update the stock details section."""
    if not selected_stock:
        return "Select a stock to view details"
    
    results_file = os.path.join(RESULTS_DIR, 'short_squeeze_scores.csv')
    if not os.path.exists(results_file):
        return "No data available"
    
    df = pd.read_csv(results_file)
    stock_data = df[df['ticker'] == selected_stock].iloc[0]
    
    return html.Div([
        html.H4(f"Short Squeeze Score: {stock_data['score']:.2f}"),
        html.P(f"Short Interest: {stock_data['short_interest']:.2%}"),
        html.P(f"Days to Cover: {stock_data['days_to_cover']:.1f}"),
        html.P(f"Volume Spike: {stock_data['volume_spike']:.1f}x"),
        html.P(f"Price Change (5d): {stock_data['price_change']:.2%}"),
        html.P(f"RSI: {stock_data['rsi']:.1f}")
    ])

def main():
    app.run(debug=True, host=DASHBOARD_HOST, port=DASHBOARD_PORT)

if __name__ == "__main__":
    main() 