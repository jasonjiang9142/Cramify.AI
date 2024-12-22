from flask import Blueprint
from flask import Flask, request, jsonify, make_response
from functions.gemini import description_into_json, parse_json_from_text
from functions.website_scrape import scrape_website
from functions.tree import json_into_tree
from flask_cors import CORS
import json

#integrate cassandra 
from cassandra.cluster import Cluster
from datetime import datetime
import uuid


landing_route = Blueprint('landing_route', __name__)


CORS(landing_route, resources=r'/api/*', headers='Content-Type')

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response


cluster = Cluster(['127.0.0.1'])  
session = cluster.connect()
session.set_keyspace('gemini_keyspace')


#------------------------------------

# Function to insert data into Cassandra
def insert_cassandra(link, response):
    try:
        # Ensure response is a string (if it’s a dictionary or list, convert it to JSON string)
        if isinstance(response, dict) or isinstance(response, list):
            response = json.dumps(response)  # Convert Python object to JSON string
        
        query = """
            INSERT INTO prompt_responses (id, prompt, response, created_at)
            VALUES (%s, %s, %s, %s)
        """
        session.execute(query, (uuid.uuid4(), link, response, datetime.now()))
        print("Data inserted successfully.")
    except Exception as e:
        print(f"Error inserting data into Cassandra: {e}")


# Retrieve data from Cassandra
def get_cassandra_query(prompt): 
    try:
        query = "SELECT response FROM prompt_responses WHERE prompt = %s ALLOW FILTERING"
        rows = session.execute(query, [prompt])
        
        # Debugging: Check what's returned from Cassandra
        for row in rows:
            print(f"Found response: {row.response}")
            return row.response

        # In case no rows are found
        print(f"No data found for prompt: {prompt}")
        return None
    except Exception as e:
        print(f"Error querying data from Cassandra: {e}")
        return None


# Get request handler
#------------------------------------
#get request for handing the url 
@landing_route.route('/', methods=['GET'])
def convert_get():
    return "Hello, yeo!"


#post request for handing the url 
@landing_route.route('/link', methods=["POST", "OPTIONS"])
def convert_link(): 
    if request.method == "OPTIONS": # CORS preflight
        return _build_cors_preflight_response()
    
    elif request.method == "POST": 
        try: 
            data = request.get_json() 
            url = data.get('url')

            if not url or not is_valid_url(url):
                return jsonify({"error": "Invalid or missing URL"}), 400
            
            #check cassandra cache data 
            cached_response = get_cassandra_query(url)
            
            if cached_response:
                try:
                    pretty_json = json.loads(cached_response)  # Ensure it's valid JSON
                except json.JSONDecodeError:
                    return jsonify({"error": "Failed to parse cached response from Cassandra."}), 400

            
            else: 
                job_description = scrape_website(url)

                if not job_description:
                    return jsonify({"error": "Failed to scrape website or job description. Please Submit Job Description Instead "}), 400

                job_json = description_into_json(job_description)

                if not job_json:
                    return jsonify({"error": "Internal server error"}), 400
                
                pretty_json = parse_json_from_text(job_json)

                insert_cassandra(url, pretty_json)

            syllabus_tree = json_into_tree(pretty_json)
            return jsonify(syllabus_tree.to_dict()), 200 
        
        except Exception as e:
            # Handle unexpected errors
            return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

#post request for handing the url 
@landing_route.route('/text', methods=["POST", "OPTIONS"])
def convert_text(): 
    if request.method == "OPTIONS": # CORS preflight
        return _build_cors_preflight_response()
    
    elif request.method == "POST": 
        try: 
            data = request.get_json() 
            job_description = data.get('url')
            if not job_description: 
                return jsonify({"error": "Invalid or missing Value"}), 400
            
            job_json = description_into_json(job_description)
            if job_json is not None:
                pretty_json = parse_json_from_text(job_json)
                
            syllabus_tree = json_into_tree(pretty_json)
            return jsonify(syllabus_tree.to_dict())
        
        except Exception as e:
            # Handle unexpected errors
            return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500



# Helper function to validate URL
def is_valid_url(url):
    from urllib.parse import urlparse
    parsed_url = urlparse(url)
    return bool(parsed_url.scheme) and bool(parsed_url.netloc)
