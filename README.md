# Short Squeeze Tracker

A web application that tracks penny stocks and identifies potential short squeeze opportunities.

## Features

- Real-time stock data tracking
- Short squeeze probability scoring
- Interactive price and volume charts
- High probability short squeeze alerts
- Automated data collection and updates

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/short-squeeze.git
cd short-squeeze
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

4. Run the application:

```bash
python app.py
```

5. Open your browser and navigate to:

```
http://localhost:5000
```

## Project Structure

```
short-squeeze/
├── app.py              # Flask application
├── requirements.txt    # Python dependencies
├── src/
│   ├── data_collector.py  # Data collection logic
│   └── utils.py          # Utility functions
├── templates/
│   └── index.html      # Main page template
└── data/
    ├── cache/         # Cached stock data
    └── results/       # Analysis results
```

## Deployment

This application can be deployed to GitHub Pages using GitHub Actions. The workflow will:

1. Build the static site
2. Deploy it to GitHub Pages
3. Update the data periodically

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
