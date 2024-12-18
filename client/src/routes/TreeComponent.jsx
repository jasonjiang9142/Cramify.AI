import React, { useRef } from "react";
import Tree from "react-d3-tree";

const TreeComponent = ({ data }) => {
    const treeContainer = useRef(null);

    // Define styles and dimensions
    const dimensions = {
        width: treeContainer.current?.offsetWidth || 800,
        height: 600,
    };

    return (
        <div ref={treeContainer} style={{ width: "100%", height: "100vh" }}>
            <Tree
                data={data}
                translate={{ x: dimensions.width / 2, y: 100 }}
                orientation="vertical"
                nodeSize={{ x: 200, y: 200 }}
                pathFunc="diagonal"
                styles={{
                    links: { stroke: "gray", strokeWidth: 1 },
                    nodes: { node: { circle: { fill: "#9bc4e2" } }, leafNode: { circle: { fill: "#b7e2c8" } } },
                }}
            />
        </div>
    );
};

export default TreeComponent;
