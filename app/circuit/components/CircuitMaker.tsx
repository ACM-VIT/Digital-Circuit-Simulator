"use client";

import React, { useRef } from "react";
import { ReactFlowProvider } from "reactflow";
import CircuitCanvas from "./CircuitCanvas";
import PendingNodePreview from "./PendingNodePreview";
import Toolbar from "@/components/Toolbar";
import { useCircuit } from "@/hooks/useCircuit";
import { GateList } from "@/constants/gates";
import { indexToLabel } from "@/utils";

export default function CircuitMaker() {
  const reactFlowWrapper = useRef(null);
  
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    reactFlowInstance,
    setReactFlowInstance,
    inputValues,
    setInputValues,
    outputValues,
    paletteOpen,
    pendingNode,
    nextLabelIndex,
    mousePos,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeUpdate,
    onEdgeUpdateStart,
    onEdgeUpdateEnd,
    handlePaletteSelect,
    handleTogglePalette,
    handlePaneClick,
  } = useCircuit();

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen" ref={reactFlowWrapper}>
        <PendingNodePreview pendingNode={pendingNode} mousePos={mousePos} />
        
        <CircuitCanvas
          nodes={nodes}
          edges={edges}
          outputValues={outputValues}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeUpdate={onEdgeUpdate}
          onEdgeUpdateStart={onEdgeUpdateStart}
          onEdgeUpdateEnd={onEdgeUpdateEnd}
          onInit={setReactFlowInstance}
          onPaneClick={handlePaneClick}
          setInputValues={setInputValues}
          setNodes={setNodes}
        />
      </div>
      
      <Toolbar
        paletteOpen={paletteOpen}
        pendingNode={pendingNode}
        nextLabelIndex={nextLabelIndex}
        GateList={GateList}
        onTogglePalette={handleTogglePalette}
        onPaletteSelect={handlePaletteSelect}
        indexToLabel={indexToLabel}
      />
    </ReactFlowProvider>
  );
}
