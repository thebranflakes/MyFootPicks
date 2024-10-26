import os
from datetime import datetime, timedelta
import logging

logging.basicConfig(
    level=logging.INFO,  # You can change this to DEBUG for more details
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# Year setting
YEAR = 2024

# Week 1 start date (NFL Season start)
week1_start_date = datetime(YEAR, 9, 4)
week_duration = timedelta(days=7)
max_weeks = 16

def get_current_week():
    today = datetime.now()
    diff_time = today - week1_start_date
    diff_days = diff_time.days
    current_week = (diff_days // 7) + 1
    logging.info(f"Calculated current week as {current_week}")
    return min(current_week, max_weeks)

# Dynamically get the current week when accessed
CURRENT_WEEK = get_current_week()
logging.info(f"Current week set to {CURRENT_WEEK}")