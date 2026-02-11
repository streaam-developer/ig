import json
import os
from instabot import Bot

def load_config():
    with open('config.json', 'r') as f:
        return json.load(f)

def upload_reel_instabot(config):
    # Create bot instance
    bot = Bot()

    # Login to Instagram
    print(f"Logging in as {config['username']}...")
    login_success = bot.login(username=config['username'], password=config['password'])

    if not login_success:
        print("Login failed! Please check your credentials.")
        return False

    print("Login successful!")

    # Check if video file exists
    if not os.path.exists(config['video_path']):
        print(f"Video file not found: {config['video_path']}")
        return False

    # Upload the video as a reel
    print(f"Uploading video: {config['video_path']}")
    upload_success = bot.upload_video(config['video_path'], caption=config['caption'])

    if upload_success:
        print("Reel uploaded successfully!")
        return True
    else:
        print("Failed to upload reel.")
        return False

def main():
    config = load_config()

    # Validate config
    required_fields = ['username', 'password', 'video_path', 'caption']
    for field in required_fields:
        if field not in config or not config[field]:
            print(f"Missing or empty config field: {field}")
            return

    try:
        success = upload_reel_instabot(config)
        if success:
            print("Upload completed successfully!")
        else:
            print("Upload failed.")
    except Exception as e:
        print(f"Error during upload: {e}")
    finally:
        # Clean up any temporary files created by Instabot
        try:
            bot = Bot()
            bot.logout()
        except:
            pass

if __name__ == "__main__":
    main()
