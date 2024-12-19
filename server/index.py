from flask import Flask, request, jsonify, make_response
from gemini import create_roadmap, topic_name_into_gemini, description_into_json, parse_json_from_text
from tree import json_into_tree, map_json_to_tree
from flask_cors import CORS 
import json




app = Flask(__name__)
CORS(app, resources=r'/api/*', headers='Content-Type')

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response


@app.route('/')
def home():
    #create_roadmap() 
    #json_into_tree()
    return "Hello, World!"

#get request for handing the url 
@app.route('/api/jobs', methods=['GET'])
def convert_get():
    return "Hello, World!"



#post request for handing the url 
@app.route('/api/jobs/link', methods=["POST", "OPTIONS"])
def convert_link(): 
    if request.method == "OPTIONS": # CORS preflight
        return _build_cors_preflight_response()
    
    elif request.method == "POST": 
        try: 
            data = request.get_json() 
            url = data.get('url')
            if not url or not is_valid_url(url):
                return jsonify({"error": "Invalid or missing URL"}), 400
            
            json = create_roadmap(url) 
            syllabus_tree = json_into_tree(json)
            return jsonify(syllabus_tree.to_dict())
        
        except Exception as e:
            # Handle unexpected errors
            return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500

#post request for handing the url 
@app.route('/api/jobs/text', methods=["POST", "OPTIONS"])
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


@app.route('/api/moreinfo', methods=['Get'])
def moreinfo_get(): 
    return "Hello, World!"

@app.route('/api/moreinfo', methods=['POST', "OPTIONS"])
def moreinfo(): 
    if request.method == "OPTIONS": # CORS preflight
        return _build_cors_preflight_response()
    
    try: 
        data = request.get_json()
        if data: 
            name = data.get('name')
            # Assuming `topic_name_into_gemini` fetches the info about the job
            name_info = topic_name_into_gemini(name)

            # Log the info for debugging purposes
            print(name_info)
            

            # Return the job info to the front end
            return jsonify(name_info), 200
        
        return jsonify({"success": False, "message": "No data provided"}), 400

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500




if __name__ == '__main__':
    app.run(debug=True)