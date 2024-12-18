from flask import Flask, request, jsonify
from gemini import create_roadmap
from tree import json_into_tree, map_json_to_tree
from flask_cors import CORS 


app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    #create_roadmap() 
    #json_into_tree()
    return "Hello, World!"

#post request for handing the url 
@app.route('/api/jobs', methods=['POST', 'OPTIONS'])
def convert(): 
    if request.method == 'OPTIONS':
        return '', 200  # Respond to preflight requests


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


# Helper function to validate URL
def is_valid_url(url):
    from urllib.parse import urlparse
    parsed_url = urlparse(url)
    return bool(parsed_url.scheme) and bool(parsed_url.netloc)



if __name__ == '__main__':
    app.run(debug=True)