"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  MiniMap,
  Node,
  ReactFlowProvider,
  updateEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { v4 } from "uuid";

import "reactflow/dist/style.css";
import Input from "@/app/circuit/components/nodes/input";
import Output from "@/app/circuit/components/nodes/output";
import Gate from "@/app/circuit/components/nodes/gate";
import Toolbar from "@/components/Toolbar";

const indexToLabel = (index: number): string => {
  let result = "";
  let current = index;

  while (current >= 0) {
    result = String.fromCharCode(65 + (current % 26)) + result;
    current = Math.floor(current / 26) - 1;
  }

  return result;
};

interface GateType {
  id: string;
  color: string;
  name: string;
  inputs?: string[];
  outputs: { [key: string]: string };
  circuit?: { gates: GateType[]; wires: Wire[] };
}

interface Wire {
  source: string;
  target: string;
}

const GateList: GateType[] = [
  {
    id: "1",
    name: "AND",
    color: "#267AB2",
    inputs: ["a", "b"],
    outputs: { out: "a && b" },
  },
  {
    id: "2",
    name: "OR",
    color: "#0D6E52",
    inputs: ["x", "y"],
    outputs: { out: "x || y" },
  },
  {
    id: "3",
    name: "NOT",
    color: "#8C1F1A",
    inputs: ["a"],
    outputs: { out: "!a" },
  },
  {
    id: "4",
    name: "NAND",
    color: "#5C2D91",
    inputs: ["a", "b"],
    outputs: { out: "!(a && b)" },
  },
  {
    id: "5",
    name: "NOR",
    color: "#1F5B70",
    inputs: ["a", "b"],
    outputs: { out: "!(a || b)" },
  },
  {
    id: "6",
    name: "XOR",
    color: "#A65B1F",
    inputs: ["a", "b"],
    outputs: { out: "(a && !b) || (!a && b)" },
  },
  {
    id: "7",
    name: "XNOR",
    color: "#3F6B2F",
    inputs: ["a", "b"],
    outputs: { out: "!((a && !b) || (!a && b))" },
  },
];

const proOptions = { hideAttribution: true };

function CircuitMaker() {
  const reactFlowWrapper = useRef(null);

  const edgeUpdateSuccessful = useRef(true);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [inputValues, setInputValues] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [outputValues, setOutputValues] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [pendingNode, setPendingNode] = useState<{
    type: string;
    gate?: GateType;
  } | null>(null);
  const [nextLabelIndex, setNextLabelIndex] = useState(0);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (pendingNode) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [pendingNode]);

  const nodeTypes = useMemo(() => {
    return {
      ip: Input,
      op: Output,
      gate: Gate,
    };
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false;
  }, []);

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
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

  const handlePaletteSelect = useCallback((type: string, gate?: GateType) => {
    let nodeType = "gate";

    if (type === "io") {
      nodeType = gate?.name.toLowerCase() === "input" ? "ip" : "op";
    } else if (type === "circuit") {
      nodeType = "gate"; // Circuits use gate node type for now
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
    // function buildCircuit(){
    //     const inputs = nodes.filter(node => node.type === 'ip');
    //     const outputs = nodes.filter(node => node.type === 'op');
    //     const gates = nodes.filter(node => node.type === 'gate');
    //     const wires = edges;
    //
    //     const visited = new Set<string>();
    //
    //     function simplifyNode(node: Node){
    //         if(node.type === 'ip'){
    //             return node.data.label;
    //         // }else if(node.type === 'op'){
    //         //     return node.data.value;
    //         }else if(node.type === 'gate'){
    //             if (!visited.has(node.id)) {
    //                 visited.add(node.id);
    //                 if (node.data.logic){
    //                     getIncomers(node, nodes, edges).map(node => simplifyNode(node));
    //                 }
    //             }
    //
    //         }
    //     }
    //
    // }

    function simulateCircuit(
      nodes: Node[],
      edges: Edge[],
      inputValues: { [key: string]: boolean }
    ) {
      const inputs = nodes.filter((node) => node.type === "ip");
      const nodeStates = new Map<string, boolean>();
      let queue: Node[] = [];

      inputs.forEach((input) => {
        nodeStates.set(input.id + "-o", inputValues[input.id] ?? false);
        queue = [...queue, ...getOutgoers(input, nodes, edges)];
      });

      function calculateNode(node: Node) {
        if (node.type === "gate") {
          const gate_inputs = edges
            .filter((edge) => edge.target === node.id)
            .map((edge) => {
              const sourceValue = nodeStates.get(edge.sourceHandle!) ?? false;
              nodeStates.set(edge.targetHandle!, sourceValue);
              return `${edge.targetHandle!.split("-").pop()}=${sourceValue}`;
            })
            .join(",");

          if (!Object.values(node.data.outputs).includes(null)) {
            Object.keys(node.data.outputs).forEach((output) => {
              let result: boolean;
              const current = nodeStates.get(node.id + "-o-" + output);
              console.log(
                `const ${gate_inputs}; return ${node.data.outputs[output]}`
              );
              result = new Function(
                `let ${node.data.inputs
                  .map((i: string) => i + "=false")
                  .join(",")};${gate_inputs}; return ${
                  node.data.outputs[output]
                }`
              )();

              if (current !== result) {
                nodeStates.set(node.id + "-o-" + output, result);
                getOutgoers(node, nodes, edges).forEach((node) =>
                  queue.push(node)
                );
              }
            });
          } else {
          }
        }

        if (node.type === "op") {
          console.log(node.id);
          const source = edges.find((edge) => edge.target === node.id);
          if (source) {
            const sourceValue = nodeStates.get(source.sourceHandle!) ?? false;
            nodeStates.set(node.id + "-i", sourceValue);
          }
        }
      }

      while (queue.length > 0) {
        const node = queue.shift()!;
        calculateNode(node);
      }

      return Object.fromEntries(nodeStates.entries());
    }

    setOutputValues(simulateCircuit(nodes, edges, inputValues));
  }, [edges, inputValues, nodes]);

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen" ref={reactFlowWrapper}>
        {pendingNode && mousePos && (
          <div
            className="pointer-events-none fixed z-50 opacity-70"
            style={{
              left: mousePos.x,
              top: mousePos.y,
            }}
          >
            <div
              className="hidden md:block px-3 py-2 rounded-md text-white font-semibold shadow-md"
              style={{ backgroundColor: pendingNode.gate?.color || "#444" }}
            >
              {pendingNode.gate?.name || "Node"}
            </div>
          </div>
        )}

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
                    setInputValues((prevState) => {
                      return { ...prevState, [node.id]: !prevState[node.id] };
                    });
                  },
                  remove: () =>
                    setNodes((prev) => prev.filter((n) => n.id !== node.id)),
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
                    setNodes((prev) => prev.filter((n) => n.id !== node.id)),
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
                  setNodes((prev) => prev.filter((n) => n.id !== node.id)),
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
          onInit={setReactFlowInstance}
          onPaneClick={handlePaneClick}
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

export default CircuitMaker;
