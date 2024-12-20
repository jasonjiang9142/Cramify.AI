from flask import Blueprint
from flask import Blueprint
from flask import Flask, request, jsonify, make_response
from functions.gemini import topic_name_into_gemini
from flask_cors import CORS

more_info_route = Blueprint('more_info_route', __name__)


@more_info_route.route('/', methods=['GET'])
def moreinfo_get(): 
    return "Hello, yeo!"


@more_info_route.route('/', methods=['POST', "OPTIONS"])
def moreinfo(): 
    if request.method == "OPTIONS":  # CORS preflight
        return jsonify({"success": True}), 200
    
    elif request.method == "POST": 
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

# #--- function to handle cors problems --- 
# def _build_cors_preflight_response():
#     response = make_response()
#     response.headers.add("Access-Control-Allow-Origin", "*")
#     response.headers.add('Access-Control-Allow-Headers', "*")
#     response.headers.add('Access-Control-Allow-Methods', "*")
#     return response