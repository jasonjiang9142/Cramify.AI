import requests
import json
from website_scrape import scrape_website
from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()

# Access environment variables
api_key = os.getenv('API_KEY')

# Function to call the gemini API
def call_gemini_api(prompt):
    print("NOTE: Calling Gemini API")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")

    try:
        response = model.generate_content(prompt)

        if hasattr(response, 'text'):
            print("NOTE: Done with calling Gemini API")
            return response.text  
        elif isinstance(response, dict):  # Check if it's a dictionary (response might be a JSON object)
            print("NOTE: Done with calling Gemini API")
            return json.dumps(response)  # Convert to JSON string
        else:
            print("Error with the response: Unexpected response format.")
            return None
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return None

# Function to turn the website into a syllabus
def description_into_json(description): 
    print("NOTE: Turning description into Json")
    
    if not description:
        print("Failed to scrape the job description.")
        return None
    
    prompt = """
    Please extract all the relevant technical technologies and skills required for the role described in the job description below. 
    Once identified, create a detailed learning syllabus for each technology or skill. The syllabus should break down each topic into smaller, progressive subtopics, starting from foundational concepts and moving toward advanced topics.

    For each technology or skill, provide:
    1. A title or overview of the technology.
    2. A list of progressive topics in the following format:
    - Topic 1
    - Topic 2
    - Topic 3
    Each topic should start from basic understanding and gradually progress to advanced concepts.

    Output the information in the following JSON format:
    {
    "learning_syllabus": {
        "<Technology_Name_1>": {
        "title": "<Title for Technology_Name_1>",
        "topics": [
            "<Topic_1>",
            "<Topic_2>",
            "<Topic_3>"
        ]
        },
        "<Technology_Name_2>": {
        "title": "<Title for Technology_Name_2>",
        "topics": [
            "<Topic_1>",
            "<Topic_2>"
        ]
        }
    }
    }
    """

    response_data = call_gemini_api(prompt + description)

    if response_data:
        print("API Response:")
        print(json.dumps(response_data, indent=4))  # Properly formatted output
        print("NOTE: Done turning description into Json")
        return response_data
    else:
        print("No response data received or an error occurred.")
        return None
    

def save_json_to_file(response_text, filename='output.json'):
    print("NOTE: Saving JSON to file")

    # Strip the Markdown code block and extra whitespace
    json_str = response_text.strip("```json\n").strip("\n```")

    # Parse the string into a JSON object
    try:
        parsed_json = json.loads(json_str)

        # Save the JSON data to a file
        with open(filename, 'w') as json_file:
            json.dump(parsed_json, json_file, indent=4)

        print(f"NOTE: JSON data has been saved to {filename}")
    
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)


def create_roadmap(website_url): 
    job_description = scrape_website(website_url)

    if job_description is None:
        print("Failed to scrape website or job description.")
        return

    job_json = description_into_json(job_description)

    if job_json is not None:
        pretty_json = save_json_to_file(job_json)
        print(pretty_json)


