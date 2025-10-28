"use client";

import { useState, useRef } from "react";
import { CircuitBoard, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

enum Circuits {
  HalfAdder,
  FullAdder,
  HalfSubtractor,
  FullSubtractor,
  Mux,
  Demux,
}

interface CircuitInfo {
  id: Circuits;
  name: string;
  description: string;
  color: string;
  inputs?: string[];
  outputs: { [key: string]: string };
}

const circuits: CircuitInfo[] = [
  {
    id: Circuits.HalfAdder,
    name: "Half Adder",
    description: "Adds two single binary digits and outputs sum and carry",
    color: "#267AB2",
    inputs: ["a", "b"],
    outputs: {
      sum: "a ^ b", // XOR
      carry: "a && b", // AND
    },
  },
  {
    id: Circuits.FullAdder,
    name: "Full Adder",
    description: "Adds three binary digits with sum and carry outputs",
    color: "#4b90beff",
    inputs: ["a", "b", "cin"],
    outputs: {
      sum: "a ^ b ^ cin", // XOR of all
      carry: "(a && b) || (b && cin) || (a && cin)", // Majority function
    },
  },
  {
    id: Circuits.HalfSubtractor,
    name: "Half Subtractor",
    description:
      "Subtracts two binary digits and outputs difference and borrow",
    color: "#1a8c3cff",
    inputs: ["a", "b"],
    outputs: {
      difference: "a ^ b", // XOR
      borrow: "!a && b", // NOT a AND b
    },
  },
  {
    id: Circuits.FullSubtractor,
    name: "Full Subtractor",
    description: "Subtracts three binary digits with difference and borrow",
    color: "#34a155ff",
    inputs: ["a", "b", "bin"],
    outputs: {
      difference: "a ^ b ^ bin", // XOR of all
      borrow: "(!a && b) || (b && bin) || (!a && bin)", // Borrow logic
    },
  },
  {
    id: Circuits.Mux,
    name: "Multiplexer (2:1)",
    description:
      "Selects one of many inputs and forwards it to a single output",
    color: "#A65B1F",
    inputs: ["i0", "i1", "s"],
    outputs: {
      out: "(i0 && !s) || (i1 && s)", // 2:1 MUX logic
    },
  },
  {
    id: Circuits.Demux,
    name: "Demultiplexer (1:2)",
    description: "Takes one input and routes it to one of many outputs",
    color: "#c2773aff",
    inputs: ["d", "s"],
    outputs: {
      y0: "d && !s", // When select = 0
      y1: "d && s", // When select = 1
    },
  },
];

interface Wire {
  source: string;
  target: string;
}

interface GateType {
  id: string;
  color: string;
  name: string;
  inputs?: string[];
  outputs: { [key: string]: string };
  circuit?: { gates: GateType[]; wires: Wire[] };
}

type LibraryProps = {
  onAddCombinational: (gate: GateType) => void;
};

export default function Library({
  onAddCombinational,
}: LibraryProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [addedCircuit, setAddedCircuit] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCircuitSelect = (circuit: CircuitInfo) => {
    const gate: GateType = {
      id: circuit.id.toString(), // or generate uuid
      name: circuit.name,
      color: circuit.color,
      inputs: circuit.inputs,
      outputs: circuit.outputs,
    };

    // add the circuit to the toolbar dynamically
    onAddCombinational(gate);
    setAddedCircuit(circuit.name);

    // Clear previous timeout (so it resets each time you click)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setAddedCircuit(null);
    }, 2000);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-24 right-6 sm:right-auto sm:top-6 sm:left-6 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/85 backdrop-blur transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <CircuitBoard className="w-4 h-4" />
          <span className="text-xs">Library</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <AnimatePresence>
            {addedCircuit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="fixed top-5 bg-emerald-500 text-white px-4 py-2 rounded-md shadow-lg z-50"
              >
                Added: {addedCircuit}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative w-full max-w-4xl h-[70%] sm:h-[80%] m-4 bg-[#353536] rounded-lg shadow-2xl border border-white/10 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-3">
                <CircuitBoard className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white/90 tracking-wide">
                  Circuit Library
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="p-6 overflow-y-auto w-full flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {circuits.map((circuit) => (
                  <button
                    key={circuit.id}
                    onClick={() => handleCircuitSelect(circuit)}
                    className="group relative p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-lg transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: circuit.color }}
                      >
                        <CircuitBoard className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="absolute top-2 right-3 text-emerald-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Add to toolbar
                    </span>

                    <h3 className="text-lg font-semibold text-white/90 mb-2">
                      {circuit.name}
                    </h3>
                    <p className="text-sm text-white/60">
                      {circuit.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
