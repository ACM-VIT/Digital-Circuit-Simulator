import React from "react";
import { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

function Branch(props: NodeProps) {
  const { data, id } = props;

  return (
    <div
      className="relative w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-600 shadow-lg cursor-pointer hover:scale-125 transition-transform"
      onContextMenu={(e) => data?.onContextMenu?.(e)}
      onDoubleClick={(e) => data?.onDoubleClick?.(e)}
      title="Branch Point - Double-click edge to create, Delete to remove"
    >
      {/* Input handle - receives signal */}
      <Handle
        type="target"
        position={Position.Left}
        id={`${id}-i`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "transparent",
          border: "none",
          width: "12px",
          height: "12px",
        }}
      />
      
      {/* Output handle - sends signal */}
      <Handle
        type="source"
        position={Position.Right}
        id={`${id}-o`}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "transparent",
          border: "none",
          width: "12px",
          height: "12px",
        }}
      />
    </div>
  );
}

export default Branch;
