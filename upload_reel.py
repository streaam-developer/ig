import json
import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

def load_config():
    with open('config.json', 'r') as f:
        return json.load(f)

def setup_driver(config):
    options = Options()
    if config.get('headless', False):
        options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)
    return driver

def login_instagram(driver, username, password):
    driver.get('https://www.instagram.com/')
    time.sleep(8)  # Increased wait time

    # Handle cookies popup
    try:
        accept_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Accept') or contains(text(),'Allow') or contains(text(),'Accept All')]"))
        )
        accept_button.click()
        time.sleep(3)
    except Exception as e:
        print(f"No cookie popup or error: {e}")

    # Try multiple selectors for username field
    username_field = None
    selectors = [
        "input[name='username']",
        "input[aria-label*='Phone number']",
        "input[aria-label*='Username']",
        "input[placeholder*='Phone number']",
        "input[placeholder*='Username']",
        "//input[@name='username']",
        "//input[contains(@aria-label,'Phone') or contains(@aria-label,'Username')]"
    ]

    for selector in selectors:
        try:
            if selector.startswith("//"):
                username_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, selector))
                )
            else:
                username_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
            print(f"Found username field with selector: {selector}")
            break
        except:
            continue

    if not username_field:
        raise Exception("Could not find username field")

    username_field.clear()
    username_field.send_keys(username)
    print(f"Entered username: {username}")
    time.sleep(2)

    # Try multiple selectors for password field
    password_field = None
    pass_selectors = [
        "input[name='password']",
        "input[type='password']",
        "input[aria-label*='Password']",
        "input[placeholder*='Password']",
        "//input[@name='password']",
        "//input[@type='password']"
    ]

    for selector in pass_selectors:
        try:
            if selector.startswith("//"):
                password_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.XPATH, selector))
                )
            else:
                password_field = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
            print(f"Found password field with selector: {selector}")
            break
        except:
            continue

    if not password_field:
        raise Exception("Could not find password field")

    password_field.clear()
    password_field.send_keys(password)
    print(f"Entered password: {'*' * len(password)}")
    time.sleep(2)

    # Click login button
    login_button = None
    login_selectors = [
        "button[type='submit']",
        "//button[@type='submit']",
        "//button[contains(text(),'Log in')]",
        "button[data-testid*='login']",
        "//div[text()='Log in']/parent::button"
    ]

    for selector in login_selectors:
        try:
            if selector.startswith("//"):
                login_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, selector))
                )
            else:
                login_button = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                )
            print(f"Found login button with selector: {selector}")
            break
        except:
            continue

    if not login_button:
        raise Exception("Could not find login button")

    login_button.click()
    print("Clicked login button")

    # Wait for login to complete
    time.sleep(15)
    try:
        WebDriverWait(driver, 45).until(
            lambda d: 'instagram.com' in d.current_url and ('/' in d.current_url or '/accounts/' not in d.current_url)
        )
        print("Login successful!")
    except Exception as e:
        print(f"Login may have failed or taken longer: {e}. Current URL: {driver.current_url}")
    time.sleep(5)

def upload_reel(driver, config):
    # Click create button - try multiple selectors
    try:
        create_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//svg[@aria-label='New post']"))
        )
    except:
        create_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//*[contains(@aria-label, 'New post') or contains(@aria-label, 'Create')]"))
        )
    create_button.click()
    time.sleep(3)

    # Select Reel - try multiple ways
    try:
        reel_option = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//span[text()='Reel']"))
        )
        reel_option.click()
    except:
        # Try clicking on the reel tab or button
        try:
            reel_tab = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//div[contains(text(),'Reel')]"))
            )
            reel_tab.click()
        except:
            # If reel option not found, assume it's already selected or proceed
            pass
    time.sleep(3)

    # Upload video
    upload_input = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.XPATH, "//input[@type='file']"))
    )
    upload_input.send_keys(config['video_path'])
    time.sleep(10)  # Wait for upload

    # Click Next
    try:
        next_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.XPATH, "//div[text()='Next']"))
        )
    except:
        next_button = WebDriverWait(driver, 20).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Next']"))
        )
    next_button.click()
    time.sleep(3)

    # Add caption
    try:
        caption_field = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//div[@role='textbox']"))
        )
    except:
        caption_field = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "textarea[placeholder*='Write a caption']"))
        )
    caption_field.clear()
    caption_field.send_keys(config['caption'])
    time.sleep(2)

    # Click Share
    try:
        share_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//div[text()='Share']"))
        )
    except:
        share_button = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Share']"))
        )
    share_button.click()

    # Wait for upload to complete
    try:
        WebDriverWait(driver, config.get('max_wait_time', 60)).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(text(),'shared') or contains(text(),'posted')]"))
        )
        print("Reel uploaded successfully!")
    except:
        print("Upload may have completed, but confirmation message not found. Check your Instagram account.")

def main():
    config = load_config()
    driver = setup_driver(config)
    try:
        login_instagram(driver, config['username'], config['password'])
        upload_reel(driver, config)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
