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
    time.sleep(3)
    try:
        # Accept cookies if prompted
        accept_button = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.XPATH, "//button[text()='Accept' or text()='Allow' or text()='Accept All']"))
        )
        accept_button.click()
        time.sleep(2)
    except:
        pass

    # Enter username
    username_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.NAME, 'username'))
    )
    username_field.send_keys(username)

    # Enter password
    password_field = driver.find_element(By.NAME, 'password')
    password_field.send_keys(password)

    # Click login
    login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
    login_button.click()

    # Wait for login to complete
    WebDriverWait(driver, 20).until(
        EC.presence_of_element_located((By.XPATH, "//div[@role='main']"))
    )
    time.sleep(5)

def upload_reel(driver, config):
    # Click create button
    create_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//svg[@aria-label='New post']"))
    )
    create_button.click()
    time.sleep(2)

    # Select Reel
    reel_option = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//span[text()='Reel']"))
    )
    reel_option.click()
    time.sleep(2)

    # Upload video
    upload_input = driver.find_element(By.XPATH, "//input[@type='file']")
    upload_input.send_keys(config['video_path'])
    time.sleep(5)  # Wait for upload

    # Click Next
    next_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[text()='Next']"))
    )
    next_button.click()
    time.sleep(2)

    # Add caption
    caption_field = WebDriverWait(driver, 10).until(
        EC.presence_of_element_located((By.XPATH, "//div[@role='textbox']"))
    )
    caption_field.send_keys(config['caption'])
    time.sleep(2)

    # Click Share
    share_button = WebDriverWait(driver, 10).until(
        EC.element_to_be_clickable((By.XPATH, "//div[text()='Share']"))
    )
    share_button.click()

    # Wait for upload to complete
    WebDriverWait(driver, config.get('max_wait_time', 30)).until(
        EC.presence_of_element_located((By.XPATH, "//div[text()='Your reel has been shared.']"))
    )
    print("Reel uploaded successfully!")

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
