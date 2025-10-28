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
import Library from "@/components/Library";
import SaveCircuitModal, {
  SaveCircuitData,
} from "@/components/SaveCircuitModal";
import CircuitLibrary from "@/components/CircuitLibrary";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useUser } from "@clerk/nextjs";
import { Save, FolderOpen, User, Plus } from "lucide-react";
import UserSync from "@/components/UserSync";
import Link from "next/link";

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
  const previousOutputValues = useRef<{ [key: string]: boolean }>({});
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [pendingNode, setPendingNode] = useState<{
    type: string;
    gate?: GateType;
  } | null>(null);
  const [nextLabelIndex, setNextLabelIndex] = useState(0);

  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );

  const { user, isLoaded } = useUser();
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentCircuitId, setCurrentCircuitId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // replace usage of GateList prop with this:
  const [combinationalGates, setCombinationalGates] = useState<GateType[]>(
    // initialize from existing GateList constant
    GateList
  );

  const addCombinationalCircuit = (gate: GateType) => {
    setCombinationalGates((prev) => {
      // avoid duplicates by name (or use id)
      if (prev.some((g) => g.name === gate.name)) return prev;
      return [...prev, { ...gate, id: v4() }]; // give unique id for toolbar instance
    });
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const circuitId = urlParams.get("load");
    if (circuitId && user) {
      loadCircuitFromUrl(circuitId);
    }
  }, [user]);

  const updateUrlWithCircuitId = (circuitId: string) => {
    const newUrl = `/circuit?load=${circuitId}`;
    window.history.pushState({}, "", newUrl);
  };

  const cleanUrl = () => {
    window.history.pushState({}, "", "/circuit");
  };

  const startNewCircuit = () => {
    setShowConfirmModal(true);
  };

  const confirmNewCircuit = () => {
    setNodes([]);
    setEdges([]);
    setInputValues({});
    setOutputValues({});
    setCurrentCircuitId(null);
    cleanUrl();
  };

  const loadCircuitFromUrl = async (circuitId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/circuits/${circuitId}`);

      if (response.ok) {
        const circuit = await response.json();
        handleLoadCircuit(circuit);
      } else if (response.status === 404) {
        alert("Circuit not found or you don't have access to it.");
      } else if (response.status === 401) {
        alert("Please sign in to access this circuit.");
      } else {
        alert("Error loading circuit. Please try again.");
      }
    } catch (error) {
      alert("Network error loading circuit. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

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
      nodeType = "gate";
    }

    setPendingNode({ type: nodeType, gate });
    if (typeof window !== "undefined" && window.innerWidth < 768) {
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
    function simulateCircuit(
      nodes: Node[],
      edges: Edge[],
      inputValues: { [key: string]: boolean },
      prevOutputValues: { [key: string]: boolean }
    ) {
      const inputs = nodes.filter((node) => node.type === "ip");
      const nodeStates = new Map<string, boolean>();

      inputs.forEach((input) => {
        nodeStates.set(input.id + "-o", inputValues[input.id] ?? false);
      });

      nodes.forEach((node) => {
        if (node.type === "gate") {
          node.data.inputs.forEach((input: string) => {
            const prevValue =
              prevOutputValues[node.id + "-i-" + input] ?? false;
            nodeStates.set(node.id + "-i-" + input, prevValue);
          });

          Object.keys(node.data.outputs).forEach((output) => {
            const prevValue =
              prevOutputValues[node.id + "-o-" + output] ?? false;
            nodeStates.set(node.id + "-o-" + output, prevValue);
          });
        }
      });

      const MAX_ITERATIONS = 100; // for preventing infinity and black screen
      let iteration = 0;
      let hasChanges = true;

      while (hasChanges && iteration < MAX_ITERATIONS) {
        hasChanges = false;
        iteration++;
        nodes.forEach((node) => {
          if (node.type === "gate") {
            const gateInputs: { [key: string]: boolean } = {};

            edges
              .filter((edge) => edge.target === node.id)
              .forEach((edge) => {
                const sourceValue = nodeStates.get(edge.sourceHandle!) ?? false;
                const inputName = edge.targetHandle!.split("-").pop()!;
                gateInputs[inputName] = sourceValue;
                const targetHandle = edge.targetHandle!;
                const prevValue = nodeStates.get(targetHandle);
                if (prevValue !== sourceValue) {
                  nodeStates.set(targetHandle, sourceValue);
                }
              });

            Object.keys(node.data.outputs).forEach((output) => {
              const outputHandle = node.id + "-o-" + output;
              const currentValue = nodeStates.get(outputHandle) ?? false;

              try {
                const inputAssignments = node.data.inputs
                  .map((i: string) => {
                    const value = gateInputs[i] ?? false;
                    return `${i}=${value}`;
                  })
                  .join(",");

                const expression = node.data.outputs[output];
                const result = new Function(
                  `let ${inputAssignments}; return ${expression}`
                )();

                if (currentValue !== result) {
                  nodeStates.set(outputHandle, result);
                  hasChanges = true;
                }
              } catch (error) {
                console.error(`Error evaluating gate ${node.id}:`, error);
              }
            });
          } else if (node.type === "op") {
            // Update output nodes
            const source = edges.find((edge) => edge.target === node.id);
            if (source) {
              const sourceValue = nodeStates.get(source.sourceHandle!) ?? false;
              const targetHandle = node.id + "-i";
              const currentValue = nodeStates.get(targetHandle);

              if (currentValue !== sourceValue) {
                nodeStates.set(targetHandle, sourceValue);
                hasChanges = true;
              }
            }
          }
        });
      }

      if (iteration >= MAX_ITERATIONS) {
        console.warn(
          "Circuit simulation reached maximum iterations - possible oscillation or complex feedback"
        );
      }

      return Object.fromEntries(nodeStates.entries());
    }

    const newOutputValues = simulateCircuit(
      nodes,
      edges,
      inputValues,
      previousOutputValues.current
    );
    setOutputValues(newOutputValues);
    previousOutputValues.current = newOutputValues;
  }, [edges, inputValues, nodes]);

  useEffect(() => {
    if (nodes.length > 0 && reactFlowInstance) {
      setTimeout(() => {
        if (reactFlowInstance) {
          reactFlowInstance.fitView({ padding: 0.1 });
        }
      }, 100);
    }
  }, [nodes.length, edges.length, reactFlowInstance]);

  useEffect(() => {
    if (nodes.length === 0 && edges.length === 0) {
      if (!loading) {
        cleanUrl();
      }
    }
  }, [nodes.length, edges.length, loading]);

  const handleSaveCircuit = async (data: SaveCircuitData) => {
    if (!user) return;

    setSaving(true);
    try {
      const nodesWithCurrentValues = nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          value:
            node.type === "ip"
              ? inputValues[node.id]
              : node.type === "op"
              ? outputValues[node.id]
              : node.data.value,
        },
      }));

      const circuitData = {
        nodes: nodesWithCurrentValues,
        edges,
        viewport: reactFlowInstance?.getViewport() || { x: 0, y: 0, zoom: 1 },
        inputValues,
        outputValues,
      };

      const response = await fetch("/api/circuits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          circuit_data: circuitData,
          category_ids: data.category_ids,
          label_ids: data.label_ids,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save circuit");
      }

      console.log("Circuit saved successfully");
    } catch (error) {
      console.error("Error saving circuit:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleLoadCircuit = (circuit: any) => {
    setLoading(true);
    try {
      const circuitData = circuit.circuit_data;

      updateUrlWithCircuitId(circuit.id);
      setCurrentCircuitId(circuit.id);

      const transformedNodes =
        circuitData.nodes?.map((node: any) => ({
          ...node,
          data: {
            ...node.data,
            id: node.id,
            type: node.type,
            position: node.position || { x: 0, y: 0 },
            ...node.data,
          },
        })) || [];

      const transformedEdges =
        circuitData.edges?.map((edge: any) => ({
          ...edge,
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          ...edge,
        })) || [];

      setNodes(transformedNodes);
      setEdges(transformedEdges);

      let newInputValues: { [key: string]: boolean } = {};
      let newOutputValues: { [key: string]: boolean } = {};

      if (circuitData.inputValues && circuitData.outputValues) {
        newInputValues = circuitData.inputValues;
        newOutputValues = circuitData.outputValues;
      } else {
        transformedNodes.forEach((node: any) => {
          if (node.type === "ip") {
            newInputValues[node.id] = node.data.value || false;
          } else if (node.type === "op") {
            newOutputValues[node.id] = node.data.value || false;
          }
        });
      }

      setInputValues(newInputValues);
      setOutputValues(newOutputValues);

      setShowLibrary(false);

      setTimeout(() => {
        if (circuitData.viewport && reactFlowInstance) {
          reactFlowInstance.setViewport(circuitData.viewport);
        }

        setTimeout(() => {
          if (reactFlowInstance) {
            reactFlowInstance.fitView({ padding: 0.1 });
            setNodes((prev) => [...prev]);
            setEdges((prev) => [...prev]);
          }

          setLoading(false);
        }, 200);
      }, 100);
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <ReactFlowProvider>
      <UserSync />
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
                  remove: () => {
                    setNodes((prev) => prev.filter((n) => n.id !== node.id));
                    setEdges((prev) =>
                      prev.filter(
                        (edge) =>
                          edge.source !== node.id && edge.target !== node.id
                      )
                    );
                  },
                },
              };
            }
            if (node.type === "op") {
              return {
                ...node,
                data: {
                  ...node.data,
                  value: outputValues[node.id + "-i"] ?? false,
                  remove: () => {
                    setNodes((prev) => prev.filter((n) => n.id !== node.id));
                    setEdges((prev) =>
                      prev.filter(
                        (edge) =>
                          edge.source !== node.id && edge.target !== node.id
                      )
                    );
                  },
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
                remove: () => {
                  setNodes((prev) => prev.filter((n) => n.id !== node.id));
                  setEdges((prev) =>
                    prev.filter(
                      (edge) =>
                        edge.source !== node.id && edge.target !== node.id
                    )
                  );
                },
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
        combinationCircuits={combinationalGates}
        onTogglePalette={handleTogglePalette}
        onPaletteSelect={handlePaletteSelect}
        indexToLabel={indexToLabel}
      />

      <Library onAddCombinational={addCombinationalCircuit} />

      {/* User Actions */}
      {isLoaded && user && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
          <button
            onClick={startNewCircuit}
            className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 hover:bg-purple-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Circuit</span>
          </button>

          <button
            onClick={() => setShowLibrary(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 hover:bg-blue-500/30 transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="text-sm font-medium">My Circuits</span>
          </button>

          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 hover:bg-emerald-500/30 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span className="text-sm font-medium">Save Circuit</span>
          </button>

          <Link href="/dashboard">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/10 border-white/20  hover:bg-white/20 rounded-full">
              <User className="w-4 h-4 text-white/70" />
              <span className="text-sm text-white/90">
                {user.firstName || user.emailAddresses[0]?.emailAddress}
              </span>
            </button>
          </Link>
        </div>
      )}

      {loading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/80 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <span className="text-white font-medium">Loading circuit...</span>
        </div>
      )}
      <SaveCircuitModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveCircuit}
        isLoading={saving}
      />

      <CircuitLibrary
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onLoadCircuit={handleLoadCircuit}
        currentCircuitId={currentCircuitId || undefined}
      />
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmNewCircuit}
        title="Start New Circuit"
        message="Are you sure you want to start a new circuit? This will clear the current circuit."
        confirmText="Start New"
        cancelText="Cancel"
        confirmButtonColor="bg-purple-500 hover:bg-purple-600"
      />
    </ReactFlowProvider>
  );
}

export default CircuitMaker;
