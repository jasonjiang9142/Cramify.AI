import requests
import json
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
    
    prompt = """Extract technical skills and technologies from the job description below. 
   Create a detailed learning syllabus for each, structured from foundational concepts to advanced topics, in JSON format:
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
    


def parse_json_from_text(response_text):
    print("NOTE: Parsing JSON from response text")

    # Strip the Markdown code block and extra whitespace
    json_str = response_text.strip("```json\n").strip("\n```")

    # Parse the string into a JSON object
    try:
        parsed_json = json.loads(json_str)

        print("NOTE: JSON data has been parsed successfully")
        return parsed_json  # Return the parsed JSON object

    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        return None  # Return None in case of erro
    
#---------

# Function to turn the topic_name into a gemini information
def topic_name_into_gemini(topic_name): 
    print("NOTE: Turning description into Json")
    
    if not topic_name:
        print("Need to give topic name")
        return None
    
    
    prompt = f"""
 Please create a detailed review or cram sheet for the topic of {topic_name}. The cram sheet should be very comprehensive and detailed where someone with little information about the topic will be able to learn fully. 
Format the Cram Sheet as JSON. The JSON format should follow this structure but feel free to include as many points as appropriate to concisely organize the info:
{{
  "topic": "{topic_name}",
  "summary": "",
  "sections": [
    {{
      "heading": "Key Concepts",
      "points": [
        {{"point": "Overview: [Brief definition or overview of the topic]"}},
        {{"point": "Fundamental Principles: [Key principles that underlie the topic]"}}
      ]
    }},
    {{
      "heading": "Important Terminology",
      "points": [
        {{"term": "[Term 1]", "definition": "[Definition of Term 1]"}},
        {{"term": "[Term 2]", "definition": "[Definition of Term 2]"}}
      ]
    }},
    {{
      "heading": "Syntax and Structure",
      "points": [
        {{"point": "[Syntax or structure related to the topic]"}},
        {{"point": "[Additional syntax or formula, if applicable]"}}
      ]
    }},
    {{
      "heading": "Common Techniques or Methods",
      "points": [
        {{"technique": "[Technique 1]", "description": "[Description of the technique]", "example": "[Example of how to apply it]"}},
        {{"technique": "[Technique 2]", "description": "[Description of the technique]", "example": "[Example of how to apply it]"}}
      ]
    }},
    {{
      "heading": "Best Practices",
      "points": [
        {{"point": "[Best practice tip 1]"}},
        {{"point": "[Best practice tip 2]"}}
      ]
    }},
    {{
      "heading": "Use Cases/Applications",
      "points": [
        {{"use_case": "[Use case 1]", "details": "[Details of the use case]"}},
        {{"use_case": "[Use case 2]", "details": "[Details of the use case]"}}
      ]
    }},
    {{
      "heading": "Resources for Further Study",
      "points": [
        {{"resource": "[Resource 1]", "link": "[URL or reference for further study]"}},
        {{"resource": "[Resource 2]", "link": "[URL or reference for further study]"}}
      ]
    }},
    {{
      "heading": "Examples",
      "examples": [
        {{"example_1": "[First example of practical application]"}},
        {{"example_2": "[Second example of practical application]"}}
      ]
    }},
    {{
      "heading": "Additional Notes",
      "points": [
        {{"point": "[Additional notes or considerations]"}}
      ]
    }}
  ]
}}
"""

    response_data = call_gemini_api(prompt)
    json_str = response_data

    if response_data:
        # Try to parse the response into JSON
        try:
            # If response is Markdown-style JSON, strip any potential code block markers
            json_str = response_data.strip("```json\n").strip("\n```")
            parsed_json = json.loads(json_str)

            print("NOTE: Done turning topic into JSON description")
            return parsed_json  # Return the parsed JSON object
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON: {e}")
            return None
        
    else:
        print("No response data received or an error occurred.")
        return None
    
