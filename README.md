# Short Squeeze Tracker

A Python application for tracking penny stocks that show strong signs of an upcoming short squeeze.

## Features

- Real-time monitoring of short interest data
- Volume analysis and spike detection
- Price momentum tracking
- News and catalyst monitoring
- Interactive dashboard for visualization
- Automated alerts for potential short squeeze opportunities

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/short-squeeze-tracker.git
cd short-squeeze-tracker
```

2. Create a virtual environment and activate it:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your API keys (if needed):

```
YAHOO_API_KEY=your_key_here
NEWS_API_KEY=your_key_here
```

## Usage

1. Start the data collection service:

```bash
python src/data_collector.py
```

2. Start the dashboard:

```bash
python src/dashboard.py
```

3. Access the dashboard at `http://localhost:8050`

## Project Structure

```
short-squeeze/
├── src/
│   ├── data_collector.py      # Data collection and processing
│   ├── dashboard.py           # Interactive dashboard
│   ├── analysis.py            # Analysis functions
│   ├── alerts.py              # Alert system
│   └── utils.py               # Utility functions
├── config/
│   └── settings.py            # Configuration settings
├── data/                      # Data storage
├── tests/                     # Test files
├── requirements.txt           # Project dependencies
└── README.md                  # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
