import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import time
from apscheduler.schedulers.background import BackgroundScheduler
from scrapers.main import main as run_scraper


def scheduled_scrape():
    print("\n" + "="*50)
    print("Running scheduled job scraper...")
    print("="*50 + "\n")
    try:
        run_scraper()
    except Exception as e:
        print(f"Error in scheduled scrape: {e}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    
   
    scheduler.add_job(
        scheduled_scrape,
        'interval',
        days=2,
        id='job_scraper',
        name='Scrape jobs every 2 days',
        replace_existing=True
    )
    
    scheduler.start()
    print("Scheduler started - will run scraper every 2 days")
    print("Press Ctrl+C to stop the scheduler")
    
    try:
       
        while True:
            time.sleep(1)
    except (KeyboardInterrupt, SystemExit):
        print("\nStopping scheduler...")
        scheduler.shutdown()
        print("Scheduler stopped.")


if __name__ == "__main__":
   
    print("Running initial scrape...")
    run_scraper()
    print("\nStarting scheduler...")
    start_scheduler()
