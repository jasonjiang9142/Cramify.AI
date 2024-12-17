from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
import validators 
import time
from bs4 import BeautifulSoup
import re
from urllib.parse import urlparse

# Function to check if the URL is valid
def is_valid_url(website_url):
    if not validators.url(website_url):
        print("This is not a valid URL. Please try again.")
        raise Exception("Invalid URL")

def is_job_url(title, page_text, url): 

    #chage text to lower case and intialize variables
    page_text = page_text.lower() 
    title = title.lower()
    job_keywords = {"description", "apply", "qualification", "qualifications" "job", "pay", "required qualification", "preferred qualification", "skill", "experience", 
                        "intern", "pay", 'application', 'job application', "requirements", "requirement"} 
    
    # Normalize spaces and use word boundaries to ensure whole word matches
    def contains_keyword(text, keywords):
        text = re.sub(r'\s+', ' ', text)  
        return any(re.search(r'\b' + re.escape(keyword) + r'\b', text) for keyword in keywords)

    # Check for job-specific keywords in the title or page text
    job_related = contains_keyword(title, job_keywords) or contains_keyword(page_text, job_keywords)

    # Check if the URL suggests a job posting (e.g., "/jobs/" or "/careers/")
    parsed_url = urlparse(url)
    job_related_url = 'jobs' in parsed_url.path or 'careers' in parsed_url.path or 'job' in parsed_url.path

    if job_related and job_related_url:
        return True
    
    return False 



# Function to scrape the website
def scrape_website(website_url): 
    
    # Validate the URL
    try:
        is_valid_url(website_url)
        print("CHECK: This is a valid URL\n")
    except Exception as e:
        print(f"Error: {e}")
        return
    
    # Try to scrape the URL now
    try: 
        # Initialize Selenium WebDriver
        driver = webdriver.Chrome()
        driver.get(website_url)

        # Wait until the page's body is present to ensure it has loaded
        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        print("Finding elements...")

        
        title = driver.title

        # Wait for the page to load content
        body = driver.find_element(By.TAG_NAME, 'body')
        for _ in range(5): 
            body.send_keys(Keys.END)
            time.sleep(2) 

        # After scrolling, grab the entire page source
        page_source = driver.page_source

        # Parse the HTML using BeautifulSoup
        soup = BeautifulSoup(page_source, 'html.parser')

        # Extract all the text content from the page (simulating top-to-bottom scraping)
        job_description = soup.get_text(separator='\n', strip=True).lower() 
        
        #check to see if the url is a valid website url 
        if not is_job_url(title, job_description, website_url): 
            raise Exception("There is an error trying to access this website. Please try another method instead")

        print("\nPage Content Scraped (Top to Bottom):")
        print(job_description)
        return job_description

        

    except Exception as e:
        print(f"Error: {e}")
        print("Please copy and paste the FULL job description instead.")
        job_description = input("Enter job description: ")
        print(job_description)
        return job_description

    finally:
        # Close the driver
        driver.quit()

# Run the scraper
#scrape_website()

