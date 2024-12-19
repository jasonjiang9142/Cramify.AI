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
    title = title.lower()
    job_keywords = {"description", "apply", "qualification", "qualifications" "job", "pay", "required qualification", "preferred qualification", "skill", "experience", 
                        "intern", "pay", 'application', 'job application', "requirements", "requirement"} 
    
    # Normalize spaces and use word boundaries to ensure whole word matches
    def normalize_and_tokenize(text):
        text = re.sub(r'\s+', ' ', text.lower())  # Normalize whitespace
        return set(text.split())
    # Check for job-specific keywords in the title or page text
    title_words = normalize_and_tokenize(title)
    page_words = normalize_and_tokenize(page_text)

    job_related = not job_keywords.isdisjoint(title_words) or not job_keywords.isdisjoint(page_words)

    # Check if the URL suggests a job posting
    parsed_url = urlparse(url)
    job_related_url = any(keyword in parsed_url.path for keyword in {"jobs", "careers", "job"})

    return job_related and job_related_url

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
        options = webdriver.ChromeOptions()
        options.add_argument('--headless')
        driver = webdriver.Chrome(options=options)
        driver.get(website_url)

        # Wait until the page's body is present to ensure it has loaded
        WebDriverWait(driver, 6).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        print("Finding elements...")

        title = driver.title

        # Wait for the page to load content
        body = driver.find_element(By.TAG_NAME, 'body')

        for _ in range(3): 
            body.send_keys(Keys.END)
            time.sleep(1) 

        # After scrolling, grab the  page source and parse the API
        soup = BeautifulSoup(driver.page_source, 'html.parser')


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
#url = "https://standard.wd1.myworkdayjobs.com/en-US/Search/job/Portland-OR/Enterprise-Architecture-Software-Engineer-Intern_REQ005248"
#scrape_website(url)

