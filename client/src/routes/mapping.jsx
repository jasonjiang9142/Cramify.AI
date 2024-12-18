import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Tree from "react-d3-tree";

const renderCustomNode = ({ nodeDatum }) => {
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

    return (
        <g >
            <rect
                x={-nodeWidth / 2}
                y={-nodeHeight / 2}
                width={nodeWidth}
                height={nodeHeight}
                rx={10}
                ry={10}
                fill="lightblue"
                stroke="black"
                strokeWidth="1"
                className='text-center px-3'
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
    const ySize = nodeIndex % 2 === 0 ? 150 : 200;
    return { x: 100, y: ySize };
};

const Mapping = () => {
    const location = useLocation();
    const { treeData } = location.state || {};
    const [selectedNode, setSelectedNode] = useState(null);
    const [filteredTreeData, setFilteredTreeData] = useState(treeData);

    const treeWrapperRef = useRef(null);

    useEffect(() => {
        if (treeData && treeData.children && treeData.children.length > 0) {
            const firstNode = treeData.children[0].name;
            setSelectedNode(firstNode);
            setFilteredTreeData([treeData.children[0]]);
        }
    }, [treeData]);

    useEffect(() => {
        if (treeWrapperRef.current) {
            const treeWidth = treeWrapperRef.current.offsetWidth;
            const treeHeight = treeWrapperRef.current.offsetHeight;

            // Set the tree's translation to be centered dynamically
            const centerX = treeWidth / 2;
            const centerY = treeHeight / 3;
            setTranslation({ x: centerX, y: centerY });
        }
    }, [treeWrapperRef]);

    const [translation, setTranslation] = useState({ x: 500, y: 300 });

    if (!treeData) {
        return <div>No tree data to display</div>;
    }

    const handleSelectNode = (e) => {
        const selectedValue = e.target.value;
        setSelectedNode(selectedValue);

        const subtree = treeData.children.find((node) => node.name === selectedValue);
        if (subtree) {
            setFilteredTreeData([subtree]);
        }
    };


    return (
        <div
            id="treeWrapper"
            ref={treeWrapperRef}
            style={{ width: "100%", height: "100vh" }}
            className="flex flex-col -space-y-12"
        >

            {/* Tree component */}
            <Tree
                data={filteredTreeData}
                orientation="vertical"
                renderCustomNodeElement={renderCustomNode}
                pathFunc="curve"
                customNodeSize={customNodeSize}
                zoom={0.7}
                translate={translation} // Use dynamic translation
                collapsible={true}
            />

            {/* Dropdown to select top-level node */}
            <div className='flex flex-col items-center'>
                <select onChange={handleSelectNode} value={selectedNode || ""} >
                    <option value="" disabled>Select a node</option>
                    {treeData.children.map((node, index) => (
                        <option key={index} value={node.name}>
                            {node.name}
                        </option>
                    ))}
                </select>

            </div>


        </div>
    );
};

export default Mapping;
