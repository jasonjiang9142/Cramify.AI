import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Tree from "react-d3-tree";
import { useNavigate } from "react-router-dom";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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
    const { treeData } = location.state || {};
    const [selectedNode, setSelectedNode] = useState(null);
    const [filteredTreeData, setFilteredTreeData] = useState(treeData);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const treeWrapperRef = useRef(null);

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
            setLoading(false); // Stop loading
        }
    }, [treeData]);

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

    const [translation, setTranslation] = useState({ x: window.innerWidth / 2, y: 50 });

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


    return (
        <div
            id="treeWrapper"
            ref={treeWrapperRef}
            style={{ width: "100%", height: "100vh" }}
            className="flex flex-col bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200"
        >
            {/* Header */}
            <div className="text-center py-6">
                <h1 className="text-4xl font-bold text-white drop-shadow-md">
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
                />
            </div>

        </div>
    );

};

export default Mapping;
