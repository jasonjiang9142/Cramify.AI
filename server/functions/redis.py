import redis

client = redis.Redis(
    host='localhost',  # Change if using remote Redis
    port=6379,
    db=0,              # Default database
    decode_responses=True  # Returns strings instead of bytes
)

print(client.ping())