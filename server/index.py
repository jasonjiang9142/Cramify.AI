from flask import Flask, request, jsonify, make_response
from functions.gemini import topic_name_into_gemini
from flask_cors import CORS 
import json
from routes.landing import landing_route
from routes.moreinfo import more_info_route
import redis


app = Flask(__name__)
client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True) #connect to redis 
CORS(app, resources=r'/api/*', headers='Content-Type')

app.register_blueprint(landing_route, url_prefix='/api/jobs')
app.register_blueprint(more_info_route, url_prefix='/api/moreinfo')

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def get_cache(key): 
    try: 
        cache_data = client.get(key) 
        if cache_data: 
            return json.loads(cache_data) 
    except redis.RedisError as e:
        print("Error getting information from the cache")
    return None 

@app.route('/')
def home():
    #create_roadmap() 
    #json_into_tree()
    return "Hello, World!"


@app.route('/api/moreinfo', methods=['POST', "OPTIONS"])
def moreinfo(): 
    if request.method == "OPTIONS": # CORS preflight
        return _build_cors_preflight_response()
    
    try: 
        data = request.get_json()
        
        if data: 
            name = data.get('name')

            #check redis for cache for the name 
            cache_data = get_cache(name) 
            if cache_data: 
                return jsonify(cache_data), 200 

            # Assuming `topic_name_into_gemini` fetches the info about the job
            name_info = topic_name_into_gemini(name)

            # Log the info for debugging purposes
            print(name_info)
            
            #store the information temporarily into cache 
            try:
                client.setex(name, 3600, json.dumps(name_info))
            except redis.RedisError as e:
                print(f"Redis error during caching: {e}")  # Log errors


            # Return the job info to the front end
            return jsonify(name_info), 200
        
        return jsonify({"success": False, "message": "No data provided"}), 400

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": "An internal server error occurred", "details": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)