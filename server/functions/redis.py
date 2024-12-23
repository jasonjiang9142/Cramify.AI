import redis, json

client = redis.Redis(
    host='localhost',  # Change if using remote Redis
    port=6379,
    db=0,              # Default database
    decode_responses=True  # Returns strings instead of bytes
)


def get_cache(key): 
    try: 
        cache_data = client.get(key) 
        if cache_data: 
            return json.loads(cache_data) 
    except redis.RedisError as e:
        print("Error getting information from the cache")
    return None 
