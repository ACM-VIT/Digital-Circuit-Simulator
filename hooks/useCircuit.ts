import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Node, Edge, useEdgesState, useNodesState, addEdge, updateEdge } from "reactflow";
import { v4 } from "uuid";
import { simulateCircuit } from "@/utils/circuitSimulation";
import { indexToLabel } from "@/utils";
import { PendingNode, MousePosition } from "@/types";

export function useCircuit() {
  const reactFlowWrapper = useRef(null);
  const edgeUpdateSuccessful = useRef(true);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: boolean }>({});
  const [outputValues, setOutputValues] = useState<{ [key: string]: boolean }>({});
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [pendingNode, setPendingNode] = useState<PendingNode | null>(null);
  const [nextLabelIndex, setNextLabelIndex] = useState(0);
  const [mousePos, setMousePos] = useState<MousePosition | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (pendingNode) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pendingNode]);

  const onConnect = useCallback(
    (params: Edge | any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: any) => {
      edgeUpdateSuccessful.current = true;
      setEdges((els) => updateEdge(oldEdge, newConnection, els));
    },
    [setEdges]
  );

  const onEdgeUpdateEnd = useCallback(
    (_: any, edge: Edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      }
      edgeUpdateSuccessful.current = true;
    },
    [setEdges]
  );

  const handlePaletteSelect = useCallback((type: string, gate?: any) => {
    let nodeType = "gate";

    if (type === "io") {
      nodeType = gate?.name.toLowerCase() === "input" ? "ip" : "op";
    } else if (type === "circuit") {
      nodeType = "gate";
    }

    setPendingNode({ type: nodeType, gate });
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      // Don't close palette on mobile after selection, let user see the structure
    }
  }, []);

  const handleTogglePalette = useCallback(() => {
    setPaletteOpen((prev) => !prev);
  }, []);

  const handlePaneClick = useCallback(
    (event: any) => {
      if (!pendingNode) {
        return;
      }

      const type = pendingNode.type;

      const position = reactFlowInstance?.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      if (!position) {
        return;
      }

      let nodeData: any;
      if (type === "gate") {
        if (!pendingNode.gate) {
          return;
        }
        nodeData = pendingNode.gate;
      } else {
        const generatedLabel = indexToLabel(nextLabelIndex);
        setNextLabelIndex((prev) => prev + 1);
        nodeData = { label: generatedLabel };
      }

      const newNode = {
        id: v4(),
        type,
        position,
        data: nodeData,
      };

      setNodes((nds) => nds.concat(newNode));
      setPendingNode(null);
    },
    [pendingNode, nextLabelIndex, reactFlowInstance, setNodes]
  );

  useEffect(() => {
    setOutputValues(simulateCircuit(nodes, edges, inputValues));
  }, [edges, inputValues, nodes]);

  return {
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
    setPaletteOpen,
    pendingNode,
    setPendingNode,
    nextLabelIndex,
    setNextLabelIndex,
    mousePos,
    reactFlowWrapper,
    edgeUpdateSuccessful,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeUpdateStart,
    onEdgeUpdate,
    onEdgeUpdateEnd,
    handlePaletteSelect,
    handleTogglePalette,
    handlePaneClick,
  };
}

