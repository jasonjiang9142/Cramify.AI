import json
import re

class Tree: 
    def __init__(self, name=None, children=None):
        self.name = name 
        if children == None: 
            self.children = [] 
        else: 
            self.children = children 
    
    def __repr__(self):
        return f"Tree(name={self.name}, children={self.children})"
    
    def to_dict(self):
        """Convert the Tree to a dictionary format."""
        return {
            'name': self.name,
            'children': [child.to_dict() for child in self.children]
        }
 

    def display(self, level=0):
        """Recursive function to display the tree structure."""
        indent = " " * (level * 2)
        print(f"{indent}{self.name}")
        for child in self.children:
            child.display(level + 1)

def split_topic_into_subtopics(topic):
    # Regular expression to split by commas, but not inside parentheses
    subtopics = re.split(r',\s*(?![^(]*\))', topic)
    return [subtopic.strip().title() for subtopic in subtopics if subtopic.strip()]


def map_json_to_tree(json_data):
    root = Tree(name="Learning Syllabus", children=[])
    
    for tech_name, tech_info in json_data['learning_syllabus'].items():
        # Create a node for the technology (e.g., "Java", "Python")
        tech_node = Tree(name=tech_name, children=[])
        
        # Add a child node for each topic in the "topics" list
        for topic in tech_info['topics']:
            topic_node = Tree(name='', children=[])
            
            # Split the topic into subtopics and add them as children to the topic node
            subtopics = split_topic_into_subtopics(topic)
            for subtopic in subtopics:
                name = tech_name + ': ' + subtopic 
                subtopic_node = Tree(name=name)
                topic_node.children.append(subtopic_node)
            
            tech_node.children.append(topic_node)
        
        # Add the technology node as a child to the root
        root.children.append(tech_node)

    return root


def load_json(filename='output.json'):
    with open(filename, 'r') as json_file:
        data = json.load(json_file)
    return data


#call function to turn tree into json 
def json_into_tree(json_data): 
    
    # Load JSON data
    #json_data = load_json()
    # Convert JSON data into a tree structure
    syllabus_tree = map_json_to_tree(json_data)

    return syllabus_tree

