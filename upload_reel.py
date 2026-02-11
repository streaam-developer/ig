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
    time.sleep(5)
    try:
        # Accept cookies if prompted
        accept_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(),'Accept') or contains(text(),'Allow') or contains(text(),'Accept All')]"))
        )
        accept_button.click()
        time.sleep(2)
    except:
        pass

    # Enter username
    username_field = WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='username']"))
    )
    username_field.clear()
    username_field.send_keys(username)
    time.sleep(1)

    # Enter password
    password_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.CSS_SELECTOR, "input[name='password']"))
    )
    password_field.clear()
    password_field.send_keys(password)
    time.sleep(1)

    # Click login
    login_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, "button[type='submit']"))
    )
    login_button.click()

    # Wait for login to complete - check for home page or profile
    time.sleep(10)
    try:
        WebDriverWait(driver, 30).until(
            lambda d: 'instagram.com' in d.current_url and ('/' in d.current_url or '/accounts/' not in d.current_url)
        )
    except:
        print("Login may have failed or taken longer. Proceeding...")
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
