#integrate cassandra 
from cassandra.cluster import Cluster
from datetime import datetime
import uuid
import json

# Connect to Cassandra cluster and session
cluster = Cluster(['127.0.0.1'])  
session = cluster.connect()
session.set_keyspace('gemini_keyspace')


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