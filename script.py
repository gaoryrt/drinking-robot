import requests
import os
import json
import google.generativeai as genai
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
    GOOGLE_API_KEY=os.getenv('GEMINI_API_KEY')
    genai.configure(api_key=GOOGLE_API_KEY)
    model = genai.GenerativeModel('gemini-pro')
    prompt = (
        "convince me to drink water immediately using the following methods:\n"
        "1. Internet slang.\n"
        "2. Gen Z lingo.\n"
        "3. use Ellipsis.\n"
        "4. use Abbreviations and acronyms.\n"
        "5. Don't output quotes, don’t output as list\n"
        "6. Insert emoji\n"
        "7. Quote popular meme lines\n"
        "8. Like you’re tweeting"
    )
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f'{type(e).__name__}: {e}')
        return '稍等一下，机器人正在喝水补充能量'

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
        response = requests.post(webhook_url, headers=headers, data=json.dumps(payload))
        print("Message sent successfully")
    except Exception as e:
        print(f'{type(e).__name__}: {e}')

# Main function
def main():
    beforenoon_webhook_url = os.getenv("BEFORE_WEBHOOK_URL")
    afternoon_webhook_url = os.getenv("AFTERNOON_WEBHOOK_URL")
    print(beforenoon_webhook_url,afternoon_webhook_url,os.getenv("GEMINI_API_KEY"))
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
