from cassandra.cluster import Cluster
from datetime import datetime
import uuid
import json

# Connect to Cassandra cluster and session
cluster = Cluster(['127.0.0.1'])  # Replace with your Cassandra node IP
session = cluster.connect('gemini_keyspace')  # Replace with your keyspace name

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


# Function to retrieve data from Cassandra
def get_cassandra_query(prompt):
    query = "SELECT response FROM prompt_responses WHERE prompt = %s ALLOW FILTERING"
    rows = session.execute(query, [prompt])
    for row in rows:
        return row.response
    
    return None



response_test2 = "```json\n{\n  \"learning_syllabus\": {\n    \"C/C++\": {\n      \"title\": \"C/C++ Programming\",\n      \"topics\": [\n        \"Introduction to C/C++: Data types, variables, operators, control flow (if-else, loops), functions, arrays.\",\n        \"Intermediate C/C++: Pointers, memory management (dynamic memory allocation, deallocation), structures, unions, enums, file I/O.\",\n        \"Advanced C/C++: Object-oriented programming (classes, inheritance, polymorphism), templates, exception handling, standard template library (STL),  memory optimization techniques, concurrency (threads, mutexes).\"\n      ]\n    },\n    \"Embedded Systems\": {\n      \"title\": \"Embedded Systems Development\",\n      \"topics\": [\n        \"Introduction to Embedded Systems: Microcontrollers, microprocessors, architecture, peripherals (timers, ADC, UART, SPI, I2C), memory organization.\",\n        \"Real-time Operating Systems (RTOS): Concepts, scheduling algorithms, task management, inter-process communication, memory management in RTOS environments (e.g., FreeRTOS, Zephyr).\",\n        \"Hardware-Software Co-design: Interfacing with sensors and actuators, debugging embedded systems, low-level programming techniques, power management in embedded systems,  development tools (e.g., IDEs, debuggers, emulators).\",\n        \"Advanced Embedded Systems: Advanced RTOS concepts, device drivers, communication protocols (e.g., CAN, Ethernet), security in embedded systems,  real-time systems analysis and design.\"\n      ]\n    },\n    \"Git\": {\n      \"title\": \"Version Control with Git\",\n      \"topics\": [\n        \"Introduction to Git: Basic commands (init, add, commit, status, log), branching, merging, resolving conflicts.\",\n        \"Intermediate Git: Remote repositories (push, pull, fetch), working with branches (creating, deleting, merging, rebasing), using tags.\",\n        \"Advanced Git: Collaboration workflows (e.g., Gitflow, GitHub Flow), using Git hooks, managing large repositories, rebasing strategies, advanced merging techniques.\"\n      ]\n    },\n    \"Machine Learning\": {\n      \"title\": \"Machine Learning for Embedded Systems\",\n      \"topics\": [\n        \"Introduction to Machine Learning: Supervised learning (regression, classification), unsupervised learning (clustering, dimensionality reduction), model evaluation metrics.\",\n        \"Deep Learning Fundamentals: Neural networks, backpropagation, convolutional neural networks (CNNs), recurrent neural networks (RNNs),  transfer learning.\",\n        \"Model Optimization for Embedded Systems: Quantization, pruning, knowledge distillation, model compression techniques, efficient neural network architectures for low-power devices.\",\n        \"Deployment on Embedded Devices:  Converting models to formats suitable for embedded systems (e.g., TensorFlow Lite, ONNX), integrating models with embedded software, performance profiling and optimization.\"\n      ]\n    },\n    \"Compiler Intrinsics\": {\n      \"title\": \"Compiler Intrinsics for Optimized Code\",\n      \"topics\": [\n        \"Introduction to Compiler Intrinsics: Understanding the concept of compiler intrinsics, benefits of using intrinsics for performance optimization.\",\n        \"Intrinsics for Specific Architectures: Learning intrinsics for common architectures like ARM Cortex-M series, exploring relevant instruction sets (e.g., NEON, SIMD).\",\n        \"Advanced Optimizations using Intrinsics: Applying intrinsics for vectorization, parallelization, and other performance-enhancing techniques. Understanding the trade-offs between using intrinsics and writing assembly language.\",\n        \"Profiling and Benchmarking: Techniques for measuring performance improvements achieved through the use of intrinsics.\"\n      ]\n    }\n  }\n}\n```\n"
# Insert data into Cassandra
insert_cassandra("test2", response_test2)

# Retrieve data from Cassandra
response = get_cassandra_query("test2")

# Print the result
print(response)