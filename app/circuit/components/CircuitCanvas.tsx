"use client";

import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import Input from "@/app/circuit/components/nodes/input";
import Output from "@/app/circuit/components/nodes/output";
import Gate from "@/app/circuit/components/nodes/gate";
import { proOptions } from "@/constants/gates";

interface CircuitCanvasProps {
  nodes: any[];
  edges: any[];
  outputValues: { [key: string]: boolean };
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  onEdgeUpdate: (oldEdge: any, newConnection: any) => void;
  onEdgeUpdateStart: () => void;
  onEdgeUpdateEnd: (event: any, edge: any) => void;
  onInit: (instance: any) => void;
  onPaneClick: (event: any) => void;
  setInputValues: (values: any) => void;
  setNodes: (nodes: any) => void;
}

export default function CircuitCanvas({
  nodes,
  edges,
  outputValues,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onEdgeUpdate,
  onEdgeUpdateStart,
  onEdgeUpdateEnd,
  onInit,
  onPaneClick,
  setInputValues,
  setNodes,
}: CircuitCanvasProps) {
  const nodeTypes = useMemo(() => {
    return {
      ip: Input,
      op: Output,
      gate: Gate,
    };
  }, []);

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={nodes.map((node) => {
        if (node.type === "ip") {
          return {
            ...node,
            data: {
              ...node.data,
              value: outputValues[node.id + "-o"] ?? false,
              toggle: () => {
                setInputValues((prevState: any) => {
                  return { ...prevState, [node.id]: !prevState[node.id] };
                });
              },
              remove: () =>
                setNodes((prev: any) => prev.filter((n: any) => n.id !== node.id)),
            },
          };
        }
        if (node.type === "op") {
          return {
            ...node,
            data: {
              ...node.data,
              value: outputValues[node.id + "-i"] ?? false,
              remove: () =>
                setNodes((prev: any) => prev.filter((n: any) => n.id !== node.id)),
            },
          };
        }
        return {
          ...node,
          data: {
            ...node.data,
            outputs: Object.fromEntries(
              Object.keys(node.data.outputs).map((i) => {
                return [
                  i,
                  {
                    ...node.data.outputs[i],
                    value: outputValues[node.id + "-o-" + i],
                  },
                ];
              })
            ),
            inputvalues: Object.fromEntries(
              node.data.inputs.map((i: string) => {
                return [
                  i,
                  {
                    ...node.data.inputs[i],
                    value: outputValues[node.id + "-i-" + i],
                  },
                ];
              })
            ),
            remove: () =>
              setNodes((prev: any) => prev.filter((n: any) => n.id !== node.id)),
          },
        };
      })}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      proOptions={proOptions}
      onInit={onInit}
      onPaneClick={onPaneClick}
    >
      <Background
        variant={BackgroundVariant.Dots}
        className="bg-[#353536]"
        gap={12}
        size={1}
      />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
