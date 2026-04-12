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
import toast from "react-hot-toast";

import "reactflow/dist/style.css";
import Input from "@/app/circuit/components/nodes/input";
import Output from "@/app/circuit/components/nodes/output";
import Gate from "@/app/circuit/components/nodes/gate";
import Branch from "@/app/circuit/components/nodes/branch";
import Toolbar from "@/components/Toolbar";
import Library from "@/components/Library";
import SaveCircuitModal, {
  SaveCircuitData,
} from "@/components/SaveCircuitModal";
import CircuitLibrary from "@/components/CircuitLibrary";
import ConfirmationModal from "@/components/ConfirmationModal";
import { Header } from "@/components/landing-page";
import { AuthModal } from "@/components/AuthModal";
import { LabelEditModal } from "@/components/LabelEditModal";
import { NodeContextMenu } from "@/components/NodeContextMenu";
import ImportCircuitModal from "@/components/ImportCircuitModal";
import InputCountModal from "@/components/InputCountModal";
import RenameModal from "@/components/RenameModal";
import { useUser } from "@clerk/nextjs";
import { Save, FolderOpen, User, Plus, Maximize2, Minimize2, History, Undo, Redo, X } from "lucide-react";
import UserSync from "@/components/UserSync";
import Link from "next/link";
import Loader from "@/components/Loader";

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
  isCombinational?: boolean;
  isImported?: boolean;
  importedCircuitId?: string;
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

interface CircuitMakerProps {
  initialCircuitId?: string | null;
}

function CircuitMaker({ initialCircuitId }: CircuitMakerProps = {}) {
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
  const [loadingPage, setLoadingPage] = useState(false);
  const [currentCircuitId, setCurrentCircuitId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [combinationalGates, setCombinationalGates] = useState<GateType[]>([]);

  const [editingLabel, setEditingLabel] = useState<{
    nodeId: string;
    currentLabel: string;
    nodeType: "input" | "output" | "gate";
  } | null>(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [currentCircuitName, setCurrentCircuitName] = useState("Untitled Circuit");
  const [currentCircuitDescription, setCurrentCircuitDescription] = useState("");
  const [currentCategoryIds, setCurrentCategoryIds] = useState<string[]>([]);
  const [currentLabelIds, setCurrentLabelIds] = useState<string[]>([]);

  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  const [copiedNodes, setCopiedNodes] = useState<Node[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<Edge[]>([]);

  const [showImportModal, setShowImportModal] = useState(false);

  const [inputCountModal, setInputCountModal] = useState<{
    nodeId: string;
    currentCount: number;
    gateName: string;
  } | null>(null);

  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);

  // History state for undo/redo
  const [history, setHistory] = useState<{
    nodes: Node[];
    edges: Edge[];
    action: string;
  }[]>([{ nodes: [], edges: [], action: 'Initial state' }]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const addCombinationalCircuit = (gate: GateType) => {
    setCombinationalGates((prev) => {
      // avoid duplicates by name (or use id)
      if (prev.some((g) => g.name === gate.name)) {
        toast('Circuit already added to toolbar', { icon: 'ℹ️' });
        return prev;
      }
      toast.success(`Added ${gate.name} to toolbar`);
      return [...prev, { ...gate, id: v4(), isCombinational: true }]; // give unique id for toolbar instance
    });
  };

  const removeCombinationalCircuit = (circuitName: string) => {
    setCombinationalGates((prev) => prev.filter((g) => g.name !== circuitName));
    toast.success(`Removed ${circuitName} from toolbar`);
  };

  const generateInputLabels = (count: number, gateType: string): string[] => {
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(String.fromCharCode(97 + i)); // a, b, c, d, e, f, g, h
    }
    return labels;
  };

  const handleChangeInputCount = useCallback((nodeId: string, newCount: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId && node.type === "gate") {
          const gateType = node.data.gateType || node.data.name;
          const newInputs = generateInputLabels(newCount, gateType);

          // Update the gate's logic expression based on gate type and input count
          let outputExpression = "";
          switch (gateType.toUpperCase()) {
            case "AND":
              outputExpression = newInputs.join(" && ");
              break;
            case "OR":
              outputExpression = newInputs.join(" || ");
              break;
            case "NAND":
              outputExpression = `!(${newInputs.join(" && ")})`;
              break;
            case "NOR":
              outputExpression = `!(${newInputs.join(" || ")})`;
              break;
            case "XOR":
              // XOR for multiple inputs: odd number of true inputs
              if (newCount === 2) {
                outputExpression = `(${newInputs[0]} && !${newInputs[1]}) || (!${newInputs[0]} && ${newInputs[1]})`;
              } else {
                outputExpression = `(${newInputs.join(" + ")}) % 2 === 1`;
              }
              break;
            case "XNOR":
              // XNOR for multiple inputs: even number of true inputs
              if (newCount === 2) {
                outputExpression = `!((${newInputs[0]} && !${newInputs[1]}) || (!${newInputs[0]} && ${newInputs[1]}))`;
              } else {
                outputExpression = `(${newInputs.join(" + ")}) % 2 === 0`;
              }
              break;
            default:
              outputExpression = node.data.outputs.out;
          }

          return {
            ...node,
            data: {
              ...node.data,
              inputs: newInputs,
              outputs: { out: outputExpression },
            },
          };
        }
        return node;
      })
    );
    toast.success(`Input count changed to ${newCount}`);
  }, [setNodes]);

  const handleImportCircuitAsBlock = useCallback((circuit: any) => {
    // Extract input and output nodes from the saved circuit
    const circuitNodes = circuit.circuit_data?.nodes || [];
    const inputNodes = circuitNodes.filter((n: any) => n.type === 'ip');
    const outputNodes = circuitNodes.filter((n: any) => n.type === 'op');

    // Create inputs and outputs arrays with labels
    const inputs = inputNodes.map((node: any, index: number) =>
      node.data?.label || `in${index + 1}`
    );
    const outputs = outputNodes.map((node: any, index: number) =>
      node.data?.label || `out${index + 1}`
    );

    // Create output object mapping
    const outputsObj: { [key: string]: string } = {};
    outputs.forEach((output: string) => {
      // Placeholder expression - actual simulation will be handled separately
      outputsObj[output] = 'false';
    });

    // Create the imported circuit gate
    const importedGate: GateType = {
      id: v4(),
      name: circuit.name,
      color: '#7C3AED', // Purple color for imported circuits
      inputs: inputs,
      outputs: outputsObj,
      circuit: circuit.circuit_data, // Store the full circuit data
      isCombinational: true,
      isImported: true,
      importedCircuitId: circuit.id,
    };

    // Set as pending node so user can place it on canvas
    setPendingNode({ type: 'gate', gate: importedGate });
    toast.success(`Place "${circuit.name}" on the canvas`);
  }, []);

  const handleEditLabel = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    let currentLabel = "";
    let nodeType: "input" | "output" | "gate" = "gate";

    if (node.type === "ip") {
      currentLabel = node.data.label || "";
      nodeType = "input";
    } else if (node.type === "op") {
      currentLabel = node.data.label || "";
      nodeType = "output";
    } else if (node.type === "gate") {
      currentLabel = node.data.name || "";
      nodeType = "gate";
    }

    setEditingLabel({ nodeId, currentLabel, nodeType });
  }, [nodes]);

  const handleSaveLabel = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          if (node.type === "ip" || node.type === "op") {
            return {
              ...node,
              data: {
                ...node.data,
                label: newLabel,
              },
            };
          } else if (node.type === "gate") {
            return {
              ...node,
              data: {
                ...node.data,
                name: newLabel,
              },
            };
          }
        }
        return node;
      })
    );
    toast.success("Label updated!");
  }, [setNodes]);

  const handleDuplicateNode = useCallback((nodeId: string) => {
    const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: v4(),
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50,
      },
      data: {
        ...nodeToDuplicate.data,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success("Node duplicated!");
  }, [nodes, setNodes]);

  const handleContextMenu = useCallback((nodeId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      nodeId,
      x: event.clientX,
      y: event.clientY,
    });
  }, []);

  // Copy selected nodes
  const handleCopy = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relatedEdges = edges.filter(
      (edge) =>
        selectedNodeIds.includes(edge.source) &&
        selectedNodeIds.includes(edge.target)
    );

    setCopiedNodes(selectedNodes);
    setCopiedEdges(relatedEdges);
    toast.success(`Copied ${selectedNodes.length} node(s)`);
  }, [nodes, edges]);

  // Paste copied nodes
  const handlePaste = useCallback(() => {
    if (copiedNodes.length === 0) return;

    const nodeIdMap = new Map<string, string>();
    const newNodes = copiedNodes.map((node) => {
      const newId = v4();
      nodeIdMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: false,
      };
    });

    const newEdges = copiedEdges.map((edge) => ({
      ...edge,
      id: v4(),
      source: nodeIdMap.get(edge.source) || edge.source,
      target: nodeIdMap.get(edge.target) || edge.target,
    }));

    setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
    toast.success(`Pasted ${newNodes.length} node(s)`);
  }, [copiedNodes, copiedEdges, setNodes, setEdges]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z: Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (currentHistoryIndex > 0) {
          isUndoRedoAction.current = true;
          const previousState = history[currentHistoryIndex - 1];
          setNodes(previousState.nodes);
          setEdges(previousState.edges);
          setCurrentHistoryIndex(currentHistoryIndex - 1);
          toast.success('Undo');
        } else {
          toast('Nothing to undo', { icon: 'ℹ️' });
        }
        return;
      }
      // Ctrl+Y or Ctrl+Shift+Z: Redo
      if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (currentHistoryIndex < history.length - 1) {
          isUndoRedoAction.current = true;
          const nextState = history[currentHistoryIndex + 1];
          setNodes(nextState.nodes);
          setEdges(nextState.edges);
          setCurrentHistoryIndex(currentHistoryIndex + 1);
          toast.success('Redo');
        } else {
          toast('Nothing to redo', { icon: 'ℹ️' });
        }
        return;
      }
      // Ctrl+C: Copy
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          handleCopy();
        }
      }
      // Ctrl+V: Paste
      if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (copiedNodes.length > 0) {
          event.preventDefault();
          handlePaste();
        }
      }
      // Delete: Remove selected nodes and edges
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const selectedNodes = nodes.filter((node) => node.selected);
        const selectedEdges = edges.filter((edge) => edge.selected);

        if (selectedNodes.length > 0 || selectedEdges.length > 0) {
          event.preventDefault();

          const selectedNodeIds = selectedNodes.map((n) => n.id);

          // Remove selected nodes
          if (selectedNodes.length > 0) {
            setNodes((nds) => nds.filter((n) => !selectedNodeIds.includes(n.id)));
          }

          // Remove edges connected to deleted nodes and selected edges
          setEdges((eds) =>
            eds.filter(
              (edge) =>
                !selectedNodeIds.includes(edge.source) &&
                !selectedNodeIds.includes(edge.target) &&
                !edge.selected
            )
          );

          const deletedCount = [];
          if (selectedNodes.length > 0) deletedCount.push(`${selectedNodes.length} node(s)`);
          if (selectedEdges.length > 0) deletedCount.push(`${selectedEdges.length} wire(s)`);
          toast.success(`Deleted ${deletedCount.join(' and ')}`);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [nodes, edges, copiedNodes, currentHistoryIndex, history, handleCopy, handlePaste, setNodes, setEdges]);

  // Track Control key for enabling branch node dragging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(true);
        // Enable dragging for branch nodes
        setNodes((nds) =>
          nds.map((node) =>
            node.type === 'branch' ? { ...node, draggable: true } : node
          )
        );
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlPressed(false);
        // Disable dragging for branch nodes
        setNodes((nds) =>
          nds.map((node) =>
            node.type === 'branch' ? { ...node, draggable: false } : node
          )
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [setNodes]);

  // Capture state changes for undo/redo history
  useEffect(() => {
    // Skip if this is an undo/redo action
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    // Only add to history if nodes or edges actually changed
    const lastHistory = history[currentHistoryIndex];
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(lastHistory?.nodes || []);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(lastHistory?.edges || []);

    if (nodesChanged || edgesChanged) {
      // Detect what action was performed
      let action = 'Modified circuit';
      const lastNodes = lastHistory?.nodes || [];
      const lastEdges = lastHistory?.edges || [];
      let shouldReplaceLastHistory = false;

      // Check for node changes
      if (nodes.length > lastNodes.length) {
        const newNode = nodes.find(n => !lastNodes.some(ln => ln.id === n.id));
        if (newNode) {
          const nodeType = newNode.type === 'gate' ? (newNode.data.name || newNode.data.gateType) : newNode.type;
          if (newNode.type === 'branch') {
            action = 'Created branch node';
          } else if (newNode.data.isImported) {
            action = `Imported ${nodeType}`;
          } else {
            action = `Added ${nodeType}`;
          }
        }
      } else if (nodes.length < lastNodes.length) {
        const deletedNode = lastNodes.find(n => !nodes.some(ln => ln.id === n.id));
        if (deletedNode) {
          const nodeLabel = deletedNode.data.label || deletedNode.data.name || deletedNode.data.gateType || 'node';
          action = `Deleted ${nodeLabel}`;
        }
      } else {
        // Check if node was moved
        const movedNode = nodes.find((n, i) => {
          const lastNode = lastNodes.find(ln => ln.id === n.id);
          return lastNode && (lastNode.position.x !== n.position.x || lastNode.position.y !== n.position.y);
        });
        if (movedNode) {
          const nodeLabel = movedNode.data.label || movedNode.data.name || movedNode.data.gateType || 'node';
          action = `Moved ${nodeLabel}`;

          // Check if last action was also moving the same node
          if (lastHistory?.action?.startsWith(`Moved ${nodeLabel}`)) {
            shouldReplaceLastHistory = true;
          }
        } else {
          // Check for label changes
          const renamedNode = nodes.find((n, i) => {
            const lastNode = lastNodes.find(ln => ln.id === n.id);
            return lastNode && lastNode.data.label !== n.data.label;
          });
          if (renamedNode) {
            action = `Renamed to ${renamedNode.data.label}`;
          }
        }
      }

      // Check for edge changes
      if (edges.length > lastEdges.length && action === 'Modified circuit') {
        action = 'Connected wires';
      } else if (edges.length < lastEdges.length && action === 'Modified circuit') {
        action = 'Disconnected wires';
      }

      // Remove any "future" history if we're not at the end
      const newHistory = history.slice(0, currentHistoryIndex + 1);

      if (shouldReplaceLastHistory) {
        // Replace the last history entry instead of adding a new one
        newHistory[newHistory.length - 1] = { nodes, edges, action };
        setHistory(newHistory);
      } else {
        // Add new state
        newHistory.push({ nodes, edges, action });

        // Limit history size to 50 steps
        if (newHistory.length > 50) {
          newHistory.shift();
          setHistory(newHistory);
          setCurrentHistoryIndex(newHistory.length - 1);
        } else {
          setHistory(newHistory);
          setCurrentHistoryIndex(newHistory.length - 1);
        }
      }
    }
  }, [nodes, edges]);

  // Handle delete for selected nodes
  const handleDeleteSelected = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    setNodes((nds) => nds.filter((n) => !selectedNodeIds.includes(n.id)));
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodeIds.includes(edge.source) &&
          !selectedNodeIds.includes(edge.target)
      )
    );
    toast.success(`Deleted ${selectedNodes.length} node(s)`);
  }, [nodes, setNodes, setEdges]);

  // Handle duplicate for selected nodes
  const handleDuplicateSelected = useCallback(() => {
    const selectedNodes = nodes.filter((node) => node.selected);
    if (selectedNodes.length === 0) return;

    const nodeIdMap = new Map<string, string>();
    const newNodes = selectedNodes.map((node) => {
      const newId = v4();
      nodeIdMap.set(node.id, newId);
      return {
        ...node,
        id: newId,
        position: {
          x: node.position.x + 50,
          y: node.position.y + 50,
        },
        selected: false,
      };
    });

    const selectedNodeIds = selectedNodes.map((n) => n.id);
    const relatedEdges = edges.filter(
      (edge) =>
        selectedNodeIds.includes(edge.source) &&
        selectedNodeIds.includes(edge.target)
    );

    const newEdges = relatedEdges.map((edge) => ({
      ...edge,
      id: v4(),
      source: nodeIdMap.get(edge.source) || edge.source,
      target: nodeIdMap.get(edge.target) || edge.target,
    }));

    setNodes((nds) => [...nds, ...newNodes]);
    setEdges((eds) => [...eds, ...newEdges]);
    toast.success(`Duplicated ${newNodes.length} node(s)`);
  }, [nodes, edges, setNodes, setEdges]);

  useEffect(() => {
    if (initialCircuitId && user) {
      loadCircuitFromUrl(initialCircuitId);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const circuitId = urlParams.get("load");
      if (circuitId && user) {
        loadCircuitFromUrl(circuitId);
      }
    }
  }, [user, initialCircuitId]);

  // Auto-save debounced effect
  useEffect(() => {
    if (!currentCircuitId || !user) return;

    const timer = setTimeout(() => {
      autoSaveCircuit();
    }, 3000); // 3 seconds debounced auto-save

    return () => clearTimeout(timer);
  }, [nodes, edges, currentCircuitName, currentCircuitDescription]);

  const autoSaveCircuit = async () => {
    if (!currentCircuitId || saving) return;

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

      await fetch(`/api/circuits/${currentCircuitId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: currentCircuitName,
          description: currentCircuitDescription,
          circuit_data: circuitData,
        }),
      });
      console.log("Auto-save successful");
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const handleRenameCircuit = async (newName: string, newDescription?: string) => {
    if (currentCircuitId) {
      try {
        const response = await fetch(`/api/circuits/${currentCircuitId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: newName,
            description: newDescription,
          }),
        });

        if (!response.ok) throw new Error("Failed to rename circuit");

        const updated = await response.json();
        setCurrentCircuitName(updated.name);
        setCurrentCircuitDescription(updated.description || "");
        toast.success("Circuit renamed");
      } catch (error) {
        toast.error("Failed to rename circuit");
      }
    } else {
      setCurrentCircuitName(newName);
      setCurrentCircuitDescription(newDescription || "");
      toast.success("Name updated (will be saved with circuit)");
    }
  };

  const updateUrlWithCircuitId = (circuitId: string) => {
    const newUrl = `/circuit/${circuitId}`;
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
        toast.error("Circuit not found or you don't have access to it.");
      } else if (response.status === 401) {
        toast.error("Please sign in to access this circuit.");
      } else {
        toast.error("Error loading circuit. Please try again.");
      }
    } catch (error) {
      toast.error(
        "Network error loading circuit. Please check your connection."
      );
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
      branch: Branch,
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

  const onEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();

      if (!reactFlowInstance) return;

      // Get click position in flow coordinates
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Create a new branch node
      const branchId = v4();
      const newBranchNode = {
        id: branchId,
        type: "branch",
        position,
        draggable: false,
        selectable: true,
        data: {
          onContextMenu: (e: React.MouseEvent) => handleContextMenu(branchId, e),
          remove: () => {
            setNodes((prev) => prev.filter((n) => n.id !== branchId));
            setEdges((prev) =>
              prev.filter(
                (e) => e.source !== branchId && e.target !== branchId
              )
            );
          },
        },
      };

      // Remove the original edge
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));

      // Create two new edges: source -> branch and branch -> target
      const edge1 = {
        id: v4(),
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: branchId,
        targetHandle: `${branchId}-i`,
      };

      const edge2 = {
        id: v4(),
        source: branchId,
        sourceHandle: `${branchId}-o`,
        target: edge.target,
        targetHandle: edge.targetHandle,
      };

      // Add the branch node and new edges
      setNodes((nds) => [...nds, newBranchNode]);
      setEdges((eds) => [...eds, edge1, edge2]);

      toast.success("Branch point created");
    },
    [reactFlowInstance, setNodes, setEdges, handleContextMenu]
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
        nodeData = {
          ...pendingNode.gate,
          gateType: pendingNode.gate.name, // Store original gate type
        };
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
        } else if (node.type === "branch") {
          // Initialize branch node states
          const prevValue = prevOutputValues[node.id + "-i"] ?? false;
          nodeStates.set(node.id + "-i", prevValue);
          nodeStates.set(node.id + "-o", prevValue);
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
          } else if (node.type === "branch") {
            // Branch nodes simply pass through the signal
            const source = edges.find((edge) => edge.target === node.id);
            if (source) {
              const sourceValue = nodeStates.get(source.sourceHandle!) ?? false;
              const inputHandle = node.id + "-i";
              const outputHandle = node.id + "-o";
              const currentValue = nodeStates.get(inputHandle);

              if (currentValue !== sourceValue) {
                nodeStates.set(inputHandle, sourceValue);
                nodeStates.set(outputHandle, sourceValue);
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
      const savedCircuit = await response.json();

      // If it's a new circuit, set the current circuit ID and update URL
      if (!currentCircuitId && savedCircuit.id) {
        setCurrentCircuitId(savedCircuit.id);
        setCurrentCircuitName(savedCircuit.name);
        setCurrentCircuitDescription(savedCircuit.description || "");
        setCurrentCategoryIds(savedCircuit.categories?.map((c: any) => c.category_id || c.category?.id) || []);
        setCurrentLabelIds(savedCircuit.labels?.map((l: any) => l.label_id || l.label?.id) || []);
        updateUrlWithCircuitId(savedCircuit.id);
      }

      toast.success("Circuit saved successfully!");
      console.log("Circuit saved successfully");
    } catch (error) {
      console.error("Error saving circuit:", error);
      toast.error("Failed to save circuit. Please try again.");
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveButtonClick = async () => {
    if (!user) return;

    // If circuit already exists, update it directly without showing modal
    if (currentCircuitId) {
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

        const response = await fetch(`/api/circuits/${currentCircuitId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            circuit_data: circuitData,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update circuit");
        }

        toast.success("Circuit saved successfully!");

        console.log("Circuit updated successfully");
      } catch (error) {
        console.error("Error updating circuit:", error);
        alert("Failed to update circuit. Please try again.");
      } finally {
        setSaving(false);
      }
    } else {
      setShowSaveModal(true);
    }
  };

  const handleLoadCircuit = (circuit: any) => {
    setLoading(true);
    try {
      const circuitData = circuit.circuit_data;

      updateUrlWithCircuitId(circuit.id);
      setCurrentCircuitId(circuit.id);
      setCurrentCircuitName(circuit.name);
      setCurrentCircuitDescription(circuit.description || "");
      setCurrentCategoryIds(circuit.categories?.map((c: any) => c.category_id || c.category?.id) || []);
      setCurrentLabelIds(circuit.labels?.map((l: any) => l.label_id || l.label?.id) || []);

      const transformedNodes =
        circuitData.nodes?.map((node: any) => ({
          ...node,
          // Set draggable false for branch nodes, true for others by default
          draggable: node.type === 'branch' ? false : (node.draggable !== undefined ? node.draggable : true),
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
      {loadingPage && <Loader />}
      {/* <UserSync /> */}
      <main className={isFullscreen ? "h-screen bg-white dark:bg-[#111111] overflow-hidden" : "min-h-screen bg-white dark:bg-[#111111]"}>
        {!isFullscreen && (
          <>
            <Header
              onLoginClick={() => setShowLogin(true)}
              onRegisterClick={() => setShowRegister(true)}
            />
            <div className="container pb-12">
              <div className="flex flex-col gap-2 pt-4">
                <p className="text-xs uppercase tracking-[0.35em] text-[#7A7FEE]">Circuit Workspace</p>
                <h1 className="text-3xl md:text-4xl font-semibold text-black dark:text-white">Build &amp; test with the same sleek experience</h1>
                <p className="text-sm text-gray-700 dark:text-gray-300 max-w-2xl">
                  Drag, drop, and simulate your circuits in a focused canvas that mirrors the landing page styling.
                </p>
              </div>
            </div>
          </>
        )}
        <div className={isFullscreen ? "h-full w-full" : "container pb-12"}>
          <div
            className={isFullscreen ? "card relative h-full overflow-visible" : "card relative mt-6 overflow-visible"}
            ref={reactFlowWrapper}
          >
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f1115] via-[#13151b] to-[#0b0c10] opacity-90"
              aria-hidden="true"
            />
            <div className={isFullscreen ? "relative h-full w-full" : "relative h-[70vh] md:h-[78vh] w-full"}>
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
                        editLabel: () => handleEditLabel(node.id),
                        onContextMenu: (e: React.MouseEvent) => handleContextMenu(node.id, e),
                        duplicate: () => handleDuplicateNode(node.id),
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
                        editLabel: () => handleEditLabel(node.id),
                        onContextMenu: (e: React.MouseEvent) => handleContextMenu(node.id, e),
                        duplicate: () => handleDuplicateNode(node.id),
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
                      outputs: node.data.outputs ? Object.fromEntries(
                        Object.keys(node.data.outputs).map((i) => {
                          return [
                            i,
                            {
                              ...node.data.outputs[i],
                              value: outputValues[node.id + "-o-" + i],
                            },
                          ];
                        })
                      ) : {},
                      inputvalues: node.data.inputs ? Object.fromEntries(
                        node.data.inputs.map((i: string) => {
                          return [
                            i,
                            {
                              ...node.data.inputs[i],
                              value: outputValues[node.id + "-i-" + i],
                            },
                          ];
                        })
                      ) : {},
                      editLabel: () => handleEditLabel(node.id),
                      onContextMenu: (e: React.MouseEvent) => handleContextMenu(node.id, e),
                      duplicate: () => handleDuplicateNode(node.id),
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
                onEdgeDoubleClick={onEdgeClick}
                multiSelectionKeyCode="Control"
                selectionKeyCode="Control"
                selectionOnDrag
                elementsSelectable={true}
                panOnDrag={true}
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  className="bg-transparent"
                  gap={12}
                  size={1}
                />
                <Controls />
                <MiniMap />
              </ReactFlow>

              <Toolbar
                paletteOpen={paletteOpen}
                pendingNode={pendingNode}
                nextLabelIndex={nextLabelIndex}
                GateList={GateList}
                combinationalCircuits={combinationalGates}
                onTogglePalette={handleTogglePalette}
                onPaletteSelect={handlePaletteSelect}
                onRemoveCombinational={removeCombinationalCircuit}
                onImportCircuit={() => setShowImportModal(true)}
                indexToLabel={indexToLabel}
              />

              <Library onAddCombinational={addCombinationalCircuit} />

              {isLoaded && user && (
                <div className="absolute top-6 right-6 z-50 flex flex-wrap items-center gap-3 justify-end">
                  <button
                    onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/15 transition-colors"
                    title="View History"
                  >
                    <History className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/15 transition-colors"
                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4" />
                    ) : (
                      <Maximize2 className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => setShowRenameModal(true)}
                    className="flex flex-col items-start px-4 py-1.5 rounded-xl border border-white/15 bg-white/5 text-white shadow-sm backdrop-blur hover:bg-white/10 transition-colors max-w-[200px]"
                  >
                    <span className="text-[10px] uppercase tracking-wider text-white/50">Current Circuit</span>
                    <span className="text-sm font-semibold truncate w-full text-left">{currentCircuitName}</span>
                  </button>

                  <button
                    onClick={startNewCircuit}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/10 text-white shadow-sm backdrop-blur hover:bg-white/15 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">New Circuit</span>
                  </button>

                  <button
                    onClick={() => setShowLibrary(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#7A7FEE]/30 bg-[#7A7FEE] text-white shadow-md hover:bg-[#6B73E8] transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-medium">My Circuits</span>
                  </button>

                  <button
                    onClick={handleSaveButtonClick}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-400/30 bg-emerald-500 text-white shadow-md hover:bg-emerald-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-200/40 border-t-white rounded-full animate-spin" />
                        <span className="text-sm font-medium">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {currentCircuitId ? "Save" : "Save Circuit"}
                        </span>
                      </>
                    )}
                  </button>
                  <Link href="/dashboard">
                    <button
                      onClick={() => {
                        setLoadingPage(true);
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-full border border-white/15 bg-white/10 text-white hover:bg-white/15 transition-colors shadow-sm"
                    >
                      <User className="w-4 h-4 text-white/80" />
                      <span className="text-sm text-white/90">
                        {user.firstName || "Test User"}
                      </span>
                    </button>
                  </Link>
                </div>
              )}

              {/* History Panel */}
              {showHistoryPanel && (
                <div className="absolute top-20 right-6 z-50 w-80 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <History className="w-5 h-5" />
                        History
                      </h3>
                      <button
                        onClick={() => setShowHistoryPanel(false)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-white/70" />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (currentHistoryIndex > 0) {
                            isUndoRedoAction.current = true;
                            const previousState = history[currentHistoryIndex - 1];
                            setNodes(previousState.nodes);
                            setEdges(previousState.edges);
                            setCurrentHistoryIndex(currentHistoryIndex - 1);
                            toast.success('Undo');
                          } else {
                            toast('Nothing to undo', { icon: 'ℹ️' });
                          }
                        }}
                        disabled={currentHistoryIndex === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Undo className="w-4 h-4" />
                        Undo
                      </button>
                      <button
                        onClick={() => {
                          if (currentHistoryIndex < history.length - 1) {
                            isUndoRedoAction.current = true;
                            const nextState = history[currentHistoryIndex + 1];
                            setNodes(nextState.nodes);
                            setEdges(nextState.edges);
                            setCurrentHistoryIndex(currentHistoryIndex + 1);
                            toast.success('Redo');
                          } else {
                            toast('Nothing to redo', { icon: 'ℹ️' });
                          }
                        }}
                        disabled={currentHistoryIndex === history.length - 1}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Redo className="w-4 h-4" />
                        Redo
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {history.length === 1 && history[0].nodes.length === 0 ? (
                      <div className="p-4 text-center text-white/50">
                        No history yet
                      </div>
                    ) : (
                      <div className="p-2">
                        {history.map((state, index) => {
                          if (index === 0 && state.nodes.length === 0) return null;

                          const nodeCount = state.nodes.length;
                          const edgeCount = state.edges.length;
                          const isCurrent = index === currentHistoryIndex;

                          return (
                            <button
                              key={index}
                              onClick={() => {
                                if (index !== currentHistoryIndex) {
                                  isUndoRedoAction.current = true;
                                  setNodes(state.nodes);
                                  setEdges(state.edges);
                                  setCurrentHistoryIndex(index);
                                  toast.success(`Jumped to: ${state.action}`);
                                }
                              }}
                              className={`w-full text-left p-3 rounded-lg mb-1 transition-colors ${isCurrent
                                ? 'bg-emerald-500/20 border border-emerald-500/50'
                                : 'hover:bg-white/5 border border-transparent'
                                }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`font-medium text-sm ${isCurrent
                                  ? 'text-emerald-400'
                                  : 'text-white'
                                  }`}>
                                  {state.action}
                                  {isCurrent && ' •'}
                                </span>
                              </div>
                              <div className="text-xs text-white/50 mt-1">
                                {nodeCount} node{nodeCount !== 1 ? 's' : ''}, {edgeCount} wire{edgeCount !== 1 ? 's' : ''}
                              </div>
                            </button>
                          );
                        }).filter(Boolean)}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-black/70 backdrop-blur-sm rounded-lg px-6 py-4 flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-white font-medium">Loading circuit...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AuthModal open={showLogin} mode="signin" onClose={() => setShowLogin(false)} />
      <AuthModal open={showRegister} mode="signup" onClose={() => setShowRegister(false)} />

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={() => {
            const selectedNodes = nodes.filter((node) => node.selected);
            if (selectedNodes.length > 1) {
              toast('Cannot rename multiple nodes at once', { icon: 'ℹ️' });
            } else {
              handleEditLabel(contextMenu.nodeId);
            }
          }}
          onDuplicate={() => {
            const selectedNodes = nodes.filter((node) => node.selected);
            if (selectedNodes.length > 1) {
              handleDuplicateSelected();
            } else {
              handleDuplicateNode(contextMenu.nodeId);
            }
          }}
          onDelete={() => {
            const selectedNodes = nodes.filter((node) => node.selected);
            if (selectedNodes.length > 1) {
              handleDeleteSelected();
            } else {
              // Delete single node
              const nodeToDelete = nodes.find((n) => n.id === contextMenu.nodeId);
              if (nodeToDelete) {
                setNodes((prev) => prev.filter((n) => n.id !== contextMenu.nodeId));
                setEdges((prev) =>
                  prev.filter(
                    (edge) =>
                      edge.source !== contextMenu.nodeId &&
                      edge.target !== contextMenu.nodeId
                  )
                );
                toast.success('Node deleted');
              }
            }
          }}
          onCopy={() => handleCopy()}
          onClose={() => setContextMenu(null)}
          selectedCount={nodes.filter((node) => node.selected).length || 1}
          isLogicGate={(() => {
            const node = nodes.find((n) => n.id === contextMenu.nodeId);
            if (node?.type === 'gate') {
              const gateType = (node.data.gateType || node.data.name || '').toUpperCase();
              return ['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(gateType);
            }
            return false;
          })()}
          onChangeInputs={() => {
            const node = nodes.find((n) => n.id === contextMenu.nodeId);
            if (node?.type === 'gate') {
              setInputCountModal({
                nodeId: node.id,
                currentCount: node.data.inputs?.length || 2,
                gateName: node.data.name || node.data.gateType,
              });
            }
          }}
        />
      )}

      <LabelEditModal
        open={!!editingLabel}
        currentLabel={editingLabel?.currentLabel || ""}
        nodeType={editingLabel?.nodeType || "gate"}
        onSave={(newLabel) => {
          if (editingLabel) {
            handleSaveLabel(editingLabel.nodeId, newLabel);
          }
        }}
        onClose={() => setEditingLabel(null)}
      />

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

      <ImportCircuitModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportCircuitAsBlock}
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

      {inputCountModal && (
        <InputCountModal
          isOpen={true}
          onClose={() => setInputCountModal(null)}
          currentCount={inputCountModal.currentCount}
          gateName={inputCountModal.gateName}
          onSave={(count) => {
            handleChangeInputCount(inputCountModal.nodeId, count);
            setInputCountModal(null);
          }}
        />
      )}

      <RenameModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRenameCircuit}
        currentName={currentCircuitName}
        currentDescription={currentCircuitDescription}
        itemType="circuit"
        title="Rename Circuit"
      />
    </ReactFlowProvider>
  );
}

export default CircuitMaker;
