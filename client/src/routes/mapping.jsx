import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Tree from "react-d3-tree";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const renderCustomNode = ({ nodeDatum, navigate }) => {

    // Function to split text into multiple lines if it's too long (e.g., 20 chars per line)
    const wrapText = (text, maxLineLength) => {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        words.forEach((word) => {
            if ((currentLine + word).length <= maxLineLength) {
                currentLine += `${word} `;
            } else {
                lines.push(currentLine.trim());
                currentLine = `${word} `;
            }
        });
        lines.push(currentLine.trim());
        return lines;
    };

    const lines = wrapText(nodeDatum.name, 20); // Wrap text
    const maxLineWidth = Math.max(...lines.map(line => line.length));
    const nodeWidth = maxLineWidth * 8; // Approx width per character
    const nodeHeight = lines.length * 18 + 20; // Height based on lines

    // Handle click event to navigate
    const handleClick = () => {
        console.log(nodeDatum.name)
        const updatedName = nodeDatum.name.replace(/\//g, '-')

        navigate(`/mapping/${updatedName}`, { state: nodeDatum.name }); // Dynamically navigate based on the node's name or id
    };



    return (
        <g onClick={handleClick} >
            <rect
                x={-nodeWidth / 2 - 5}
                y={-nodeHeight / 2 - 5}
                width={nodeWidth == 0 ? nodeWidth : nodeWidth + 10}
                height={nodeHeight == 0 ? nodeHeight : nodeHeight + 10}
                rx={10}
                ry={10}
                fill="lightblue"
                stroke="black"
                strokeWidth="1"
                className='text-center'
            />

            <text
                fill="black"
                strokeWidth="1"
                x={0}
                y={-nodeHeight / 2 + 24}
                textAnchor="middle"
                fontSize="12px"
            >
                {lines.map((line, index) => (
                    <tspan x={0} dy={index === 0 ? 0 : "1.2em"} key={index}>
                        {line}
                    </tspan>
                ))}
            </text>
        </g>
    );
};

// Dynamically alternate node size (y-axis) based on index at the same level
const customNodeSize = (nodeDatum) => {
    const nodeIndex = nodeDatum.parent ? nodeDatum.parent.children.indexOf(nodeDatum) : 0; // Find index of node in its parent's children
    const ySize = nodeIndex % 2 === 0 ? 250 : 200;
    return { x: 200, y: ySize };
};

const Mapping = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { treeData } = location.state || {};

    const [selectedNode, setSelectedNode] = useState(null);
    const [filteredTreeData, setFilteredTreeData] = useState(treeData);
    const [selectedNodeOrder, setSelectedNodeOrder] = useState([]);


    const [loading, setLoading] = useState(true);
    const treeWrapperRef = useRef(null);
    const [translation, setTranslation] = useState({ x: window.innerWidth / 2, y: 50 });

    const [zoom, setZoom] = useState(0.9); // Initial zoom level


    // Function to get all leaf nodes in the tree
    const getLeafNodes = (node) => {
        const leaves = [];

        // Recursive function to traverse the tree
        const traverse = (currentNode) => {
            if (!currentNode.children || currentNode.children.length === 0) {
                // If no children, it's a leaf node
                leaves.push(currentNode.name);
            } else {
                // Otherwise, keep traversing its children
                currentNode.children.forEach(child => traverse(child));
            }
        };

        traverse(node);
        return leaves;
    };

    // used to create the roadmap once selected node is initalized 
    useEffect(() => {

        if (!treeData || !selectedNode) {
            return;
        }
        const selectedNodeObj = treeData.children.find((node) => node.name === selectedNode);
        const leaves = getLeafNodes(selectedNodeObj);
        setSelectedNodeOrder(leaves);
    }, [treeData, selectedNode]);

    // used to get the selected node and then filter the tree data to only show the selected node
    useEffect(() => {
        setLoading(true); // Start loading

        try {
            // Ensure treeData is defined and has children before proceeding
            if (treeData && treeData.children && treeData.children.length > 0) {
                const getFirstNode = () => {
                    const firstNode = treeData.children[0]; // Default to first node
                    setSelectedNode(firstNode.name); // Set the first node as selected
                    setFilteredTreeData([firstNode]); // Show the first node's subtree

                };

                const savedNode = localStorage.getItem("selectedNode"); // Retrieve saved node

                if (savedNode) {
                    setSelectedNode(savedNode); // Set the saved node as selected
                    const subtree = treeData.children.find(
                        (node) => node.name === savedNode
                    );

                    if (subtree) {
                        setFilteredTreeData([subtree]); // Show the subtree of the selected node
                    } else {
                        console.warn("Saved node not found in tree data.");
                        getFirstNode();
                    }
                } else {
                    getFirstNode();
                }
            } else {
                console.warn("Tree data or children are missing.");
                navigate('/'); // Redirect if tree data is invalid
            }
        } catch (error) {
            console.error("An error occurred:", error); // Log error if exception occurs
            navigate('/'); // Redirect to home
        } finally {
            // Get the order of the selected node
            setLoading(false); // Stop loading
        }
    }, [treeData]);

    // Dynamically center the tree based on the wrapper's dimensions
    useEffect(() => {
        if (treeWrapperRef.current) {
            const treeWidth = treeWrapperRef.current.offsetWidth;
            const treeHeight = treeWrapperRef.current.offsetHeight;

            // Set the tree's translation to be centered dynamically
            const centerX = treeWidth / 2;
            const centerY = treeHeight / 12;
            setTranslation({ x: centerX, y: centerY });
        }
    }, [treeWrapperRef]);



    if (!treeData) {
        navigate('/');
        return <div>No tree data to display</div>;
    }

    const handleSelectNode = (e) => {
        const selectedValue = e.target.value;
        setSelectedNode(selectedValue);

        // Save the selected node to localStorage
        localStorage.setItem("selectedNode", selectedValue);

        const subtree = treeData.children.find((node) => node.name === selectedValue);

        if (subtree) {
            setFilteredTreeData([subtree]); // Only display the selected subtree
        }


    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-gray-200 animate-spin"></div>
                    </div>
                    <h1 className="text-lg font-medium text-gray-700 animate-pulse">
                        Processing your request...
                    </h1>
                    <p className="text-sm text-gray-500">
                        Sit tight! Our AI is hard at work analyzing your submission. Estimated time is 30 seconds.
                    </p>
                </div>
            </div>
        );
    }

    const handleClick = (nodeDatum) => {
        const updatedName = nodeDatum.replace(/\//g, '-'); // Sanitize the name to fit URL format
        navigate(`/mapping/${updatedName}`, { state: nodeDatum });
    };



    // Define zoom limits
    const minZoom = 0.5;
    const maxZoom = 1.5;

    // Handle zoom changes by updating the zoom state
    const handleZoom = (event) => {
        const newZoom = event.transform.k;

        // Ensure the zoom stays within the desired bounds
        if (newZoom < minZoom) {
            setZoom(minZoom); // Enforce minimum zoom
        } else if (newZoom > maxZoom) {
            setZoom(maxZoom); // Enforce maximum zoom
        } else {
            setZoom(newZoom); // Set zoom to the new value within bounds
        }
    };



    return (
        <div>
            <div
                id="treeWrapper"
                ref={treeWrapperRef}
                style={{ width: "100%", height: "95vh" }}
                className="flex flex-col bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"
            >
                {/* Header */}
                <div className="text-center py-6 mt-10">
                    <h1 className="text-4xl font-bold text-gray-700 drop-shadow-md">
                        Here are all of the topics you have to know.
                    </h1>
                    <p className="text-xl text-white opacity-80 mt-2">
                        Click on a node to generate a cram sheet for that topic.
                    </p>


                </div>

                {/* Dropdown to select top-level node */}
                <div className="flex justify-center p-4 rounded-lg mx-4">
                    <select
                        onChange={handleSelectNode}
                        value={selectedNode || ""}
                        className="w-60 p-3 bg-indigo-600 text-white rounded-lg shadow-md focus:ring-2 focus:ring-indigo-400"
                    >
                        <option value="" disabled>Select a node</option>
                        {treeData.children.map((node, index) => (
                            <option key={index} value={node.name}>
                                {node.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tree Component */}
                <div className="flex-1 overflow-hidden p-4 flex items-center justify-center">
                    {/* Ensure the tree is centered */}
                    <Tree
                        data={filteredTreeData}
                        orientation="vertical"
                        renderCustomNodeElement={(props) => renderCustomNode({ ...props, navigate })}
                        pathFunc="curve"
                        nodesize={{ x: 200, y: 300 }}
                        zoom={0.9}
                        translate={translation} // Use dynamic translation
                        collapsible={true}
                        onZoom={handleZoom}
                    />
                </div>

            </div>
            <div>
                <div className="max-w-4xl mx-auto my-10 p-5">
                    <h2 className="text-2xl font-bold text-center mb-6">Progress Timeline</h2>
                    <div className="relative">
                        {selectedNodeOrder.map((node, index) => (
                            <div className="flex items-center my-4" key={index}>
                                <div key={index} className="relative flex items-center">
                                    {/* Circle for step indicator */}
                                    <div
                                        className={`w-6 h-6 rounded-full border-2 ${index === selectedNodeOrder.length - 1
                                            ? "bg-green-500 border-green-500"
                                            : "bg-gray-500 border-gray-500"
                                            } absolute left-1/2 transform -translate-x-1/2`}
                                    />
                                    {/* Connecting line */}
                                    {index < selectedNodeOrder.length - 1 && (
                                        <div
                                            className="absolute left-1/2 top-3 transform -translate-x-1/2"
                                            style={{ borderLeft: "2px solid #d1d5db", height: "20px" }}
                                        />
                                    )}

                                </div>
                                {/* Step information */}
                                <div className="pl-10 w-full">
                                    <p className="font-semibold">{node}</p>
                                    <div className='flex justify-between items-center'>
                                        <span className="text-sm text-blue-600 mt-1">Step {index + 1}</span>
                                        <a
                                            href="#"
                                            className="text-blue-600 text-sm hover:underline mt-1"
                                            onClick={(e) => {
                                                e.preventDefault(); // Prevent the default link behavior
                                                handleClick(node);  // Call handleClick on click
                                            }}
                                        >
                                            Go to step
                                        </a>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container mx-auto px-6 ">
                    <Button onClick={() => navigate(-1)} type="submit" variant="default" className="mb-6 inline-flex items-center justify-center px-6 py-3 text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300">
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Go Back
                    </Button>

                </div>
            </div>




        </div>
    );

};

export default Mapping;
