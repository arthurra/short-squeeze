import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import json
import sys
from pathlib import Path
from datetime import datetime

# Add the project root directory to the Python path
project_root = str(Path(__file__).parent.parent)
sys.path.append(project_root)

from config.settings import *
from src.utils import *

class AlertSystem:
    def __init__(self):
        self.alert_history_file = os.path.join(RESULTS_DIR, 'alert_history.json')
        self.ensure_directories()
        self.load_alert_history()
    
    def ensure_directories(self):
        """Ensure all required directories exist."""
        os.makedirs(RESULTS_DIR, exist_ok=True)
    
    def load_alert_history(self):
        """Load the alert history from file."""
        if os.path.exists(self.alert_history_file):
            with open(self.alert_history_file, 'r') as f:
                self.alert_history = json.load(f)
        else:
            self.alert_history = []
    
    def save_alert_history(self):
        """Save the alert history to file."""
        with open(self.alert_history_file, 'w') as f:
            json.dump(self.alert_history, f, default=str)
    
    def send_email_alert(self, ticker, score, metrics):
        """Send an email alert for a potential short squeeze."""
        if not ALERT_EMAIL:
            return
        
        message = MIMEMultipart()
        message['From'] = ALERT_EMAIL
        message['To'] = ALERT_EMAIL
        message['Subject'] = f"🚨 Short Squeeze Alert: {ticker}"
        
        body = format_alert_message(ticker, score, metrics)
        message.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(ALERT_EMAIL, os.getenv('EMAIL_PASSWORD'))
            server.send_message(message)
            server.quit()
        except Exception as e:
            print(f"Error sending email alert: {str(e)}")
    
    def check_for_alerts(self):
        """Check for potential short squeeze alerts."""
        results_file = os.path.join(RESULTS_DIR, 'short_squeeze_scores.csv')
        if not os.path.exists(results_file):
            return
        
        df = pd.read_csv(results_file)
        for _, row in df.iterrows():
            if row['score'] >= ALERT_THRESHOLD:
                # Check if we've already alerted for this stock recently
                recent_alerts = [
                    alert for alert in self.alert_history
                    if alert['ticker'] == row['ticker'] and
                    (datetime.now() - datetime.fromisoformat(alert['timestamp'])).days < 1
                ]
                
                if not recent_alerts:
                    # Send alert
                    metrics = {
                        'short_interest': row['short_interest'],
                        'days_to_cover': row['days_to_cover'],
                        'volume_spike': row['volume_spike'],
                        'price_change': row['price_change'],
                        'rsi': row['rsi']
                    }
                    
                    self.send_email_alert(row['ticker'], row['score'], metrics)
                    
                    # Record alert in history
                    self.alert_history.append({
                        'ticker': row['ticker'],
                        'score': row['score'],
                        'timestamp': datetime.now().isoformat()
                    })
                    self.save_alert_history()
    
    def get_recent_alerts(self, limit=5):
        """Get the most recent alerts."""
        return sorted(
            self.alert_history,
            key=lambda x: x['timestamp'],
            reverse=True
        )[:limit]

def main():
    alert_system = AlertSystem()
    
    # Schedule alert checks
    schedule.every(UPDATE_INTERVAL).seconds.do(alert_system.check_for_alerts)
    
    # Run immediately
    alert_system.check_for_alerts()
    
    # Keep the script running
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    main() 