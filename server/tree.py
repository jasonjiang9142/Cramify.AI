import json

class Tree: 
    def __init__(self, name, children=None):
        self.name = name 
        if children == None: 
            self.children = [] 
        else: 
            self.children = children 
    
    def __repr__(self):
        return f"Tree(name={self.name}, children={self.children})"

    def display(self, level=0):
        """Recursive function to display the tree structure."""
        indent = " " * (level * 2)
        print(f"{indent}{self.name}")
        for child in self.children:
            child.display(level + 1)

def map_json_to_tree(json_data):
    root = Tree(name="Learning Syllabus", children=[])
    
    for tech_name, tech_info in json_data['learning_syllabus'].items():
        # Create a node for the technology
        tech_node = Tree(name=tech_name, children=[])

        # Create a node for each topic and add it as a child to the tech node
        for topic in tech_info['topics']:
            topic_node = Tree(name=topic)
            tech_node.children.append(topic_node)

        # Add the technology node as a child of the root
        root.children.append(tech_node)

    return root

def load_json(filename='output.json'):
    with open(filename, 'r') as json_file:
        data = json.load(json_file)
    return data


#call function to turn tree into json 
def json_into_tree(): 
    
    # Load JSON data
    json_data = load_json()

    # Convert JSON data into a tree structure
    syllabus_tree = map_json_to_tree(json_data)


    # Display the tree
    syllabus_tree.display()

