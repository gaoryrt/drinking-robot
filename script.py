import requests
import os
import json
from datetime import datetime, timedelta, timezone

# Function to check if the current time is within a specific time window
def is_time_in_window(target_time_str, window_minutes=30):
    # Define China Standard Time offset
    cst_offset = timezone(timedelta(hours=8))
    # Parse the target time string into a time object
    target_time = datetime.strptime(target_time_str, "%H:%M").time()
    # Get the current time in UTC and convert it to CST
    now = datetime.now(timezone.utc).astimezone(cst_offset).time()

    # Define the start and end of the time window
    window_start = (datetime.combine(datetime.today(), target_time) - timedelta(minutes=window_minutes)).time()
    window_end = (datetime.combine(datetime.today(), target_time) + timedelta(minutes=window_minutes)).time()

    # Check if the current time is within the window
    return window_start <= now <= window_end

def get_generated_message():
    return '该喝水了'

# Function to send a message to a webhook
def send_message_to_webhook(webhook_url, message):
    headers = {'Content-Type': 'application/json'}
    payload = ''
    if isinstance(message, str):
        payload = {
            "msgtype": "text",
            "text": {
                "content": message,
            }
        }
    else:
        payload = message
    try:
        requests.post(webhook_url, headers=headers, data=json.dumps(payload))
        print("Message sent successfully")
    except Exception as e:
        print(f'{type(e).__name__}: {e}')

# Main function
def main():
    beforenoon_webhook_url = os.getenv("BEFORE_WEBHOOK_URL")
    afternoon_webhook_url = os.getenv("AFTERNOON_WEBHOOK_URL")
    print("script is runnnig!")
    if is_time_in_window("10:45"):
        message = get_generated_message()
        print(message)
        send_message_to_webhook(beforenoon_webhook_url, message)
    else:
        message = get_generated_message()
        print(message)
        send_message_to_webhook(afternoon_webhook_url, message)

if __name__ == "__main__":
    main()
