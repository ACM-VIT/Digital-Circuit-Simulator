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
  Decoder2to4,
  Decoder3to8,
  Encoder4to2,
  Encoder8to3,
  Adder4Bit,
  Comparator,
  ParityGenerator,
  Mux4to1,
  Mux8to1,
  Demux1to4,
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
  {
    id: Circuits.Decoder2to4,
    name: "2-to-4 Decoder",
    description: "Decodes 2-bit input to activate 1 of 4 outputs",
    color: "#7C3AED",
    inputs: ["a0", "a1"],
    outputs: {
      y0: "!a1 && !a0",
      y1: "!a1 && a0",
      y2: "a1 && !a0",
      y3: "a1 && a0",
    },
  },
  {
    id: Circuits.Decoder3to8,
    name: "3-to-8 Decoder",
    description: "Decodes 3-bit input to activate 1 of 8 outputs",
    color: "#8B5CF6",
    inputs: ["a0", "a1", "a2"],
    outputs: {
      y0: "!a2 && !a1 && !a0",
      y1: "!a2 && !a1 && a0",
      y2: "!a2 && a1 && !a0",
      y3: "!a2 && a1 && a0",
      y4: "a2 && !a1 && !a0",
      y5: "a2 && !a1 && a0",
      y6: "a2 && a1 && !a0",
      y7: "a2 && a1 && a0",
    },
  },
  {
    id: Circuits.Encoder4to2,
    name: "4-to-2 Encoder",
    description: "Encodes 4 inputs to 2-bit binary output",
    color: "#EC4899",
    inputs: ["d0", "d1", "d2", "d3"],
    outputs: {
      a0: "d1 || d3",
      a1: "d2 || d3",
    },
  },
  {
    id: Circuits.Encoder8to3,
    name: "8-to-3 Encoder",
    description: "Encodes 8 inputs to 3-bit binary output",
    color: "#F472B6",
    inputs: ["d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7"],
    outputs: {
      a0: "d1 || d3 || d5 || d7",
      a1: "d2 || d3 || d6 || d7",
      a2: "d4 || d5 || d6 || d7",
    },
  },
  {
    id: Circuits.Adder4Bit,
    name: "4-bit Binary Adder",
    description: "Adds two 4-bit binary numbers with carry output",
    color: "#3B82F6",
    inputs: ["a0", "a1", "a2", "a3", "b0", "b1", "b2", "b3", "cin"],
    outputs: {
      s0: "(a0 ^ b0) ^ cin",
      c1: "(a0 && b0) || ((a0 ^ b0) && cin)",
      s1: "(a1 ^ b1) ^ ((a0 && b0) || ((a0 ^ b0) && cin))",
      c2: "(a1 && b1) || ((a1 ^ b1) && ((a0 && b0) || ((a0 ^ b0) && cin)))",
      s2: "(a2 ^ b2) ^ ((a1 && b1) || ((a1 ^ b1) && ((a0 && b0) || ((a0 ^ b0) && cin))))",
      c3: "(a2 && b2) || ((a2 ^ b2) && ((a1 && b1) || ((a1 ^ b1) && ((a0 && b0) || ((a0 ^ b0) && cin)))))",
      s3: "(a3 ^ b3) ^ ((a2 && b2) || ((a2 ^ b2) && ((a1 && b1) || ((a1 ^ b1) && ((a0 && b0) || ((a0 ^ b0) && cin))))))",
      cout: "(a3 && b3) || ((a3 ^ b3) && ((a2 && b2) || ((a2 ^ b2) && ((a1 && b1) || ((a1 ^ b1) && ((a0 && b0) || ((a0 ^ b0) && cin)))))))",
    },
  },
  {
    id: Circuits.Comparator,
    name: "Comparator",
    description: "Compares two numbers (A > B, A = B, A < B)",
    color: "#10B981",
    inputs: ["a", "b"],
    outputs: {
      gt: "a && !b", // A > B
      eq: "(a && b) || (!a && !b)", // A = B
      lt: "!a && b", // A < B
    },
  },
  {
    id: Circuits.ParityGenerator,
    name: "Parity Generator",
    description: "Generates even parity bit for 4-bit input",
    color: "#F59E0B",
    inputs: ["d0", "d1", "d2", "d3"],
    outputs: {
      parity: "d0 ^ d1 ^ d2 ^ d3", // Even parity
    },
  },
  {
    id: Circuits.Mux4to1,
    name: "4:1 Multiplexer",
    description: "Selects 1 of 4 inputs using 2 select lines",
    color: "#EF4444",
    inputs: ["i0", "i1", "i2", "i3", "s0", "s1"],
    outputs: {
      out: "(i0 && !s1 && !s0) || (i1 && !s1 && s0) || (i2 && s1 && !s0) || (i3 && s1 && s0)",
    },
  },
  {
    id: Circuits.Mux8to1,
    name: "8:1 Multiplexer",
    description: "Selects 1 of 8 inputs using 3 select lines",
    color: "#DC2626",
    inputs: ["i0", "i1", "i2", "i3", "i4", "i5", "i6", "i7", "s0", "s1", "s2"],
    outputs: {
      out: "(i0 && !s2 && !s1 && !s0) || (i1 && !s2 && !s1 && s0) || (i2 && !s2 && s1 && !s0) || (i3 && !s2 && s1 && s0) || (i4 && s2 && !s1 && !s0) || (i5 && s2 && !s1 && s0) || (i6 && s2 && s1 && !s0) || (i7 && s2 && s1 && s0)",
    },
  },
  {
    id: Circuits.Demux1to4,
    name: "1:4 Demultiplexer",
    description: "Routes 1 input to 1 of 4 outputs using 2 select lines",
    color: "#F97316",
    inputs: ["d", "s0", "s1"],
    outputs: {
      y0: "d && !s1 && !s0",
      y1: "d && !s1 && s0",
      y2: "d && s1 && !s0",
      y3: "d && s1 && s0",
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
          className="absolute top-24 right-6 sm:right-auto sm:top-6 sm:left-6 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/85 backdrop-blur transition-all hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
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

          <div className="relative w-full max-w-4xl h-[70%] sm:h-[80%] m-4 bg-[#141414]/95 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden backdrop-blur">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 flex-shrink-0">
              <div className="flex items-center gap-3">
                <CircuitBoard className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold text-white/90 uppercase tracking-[0.15em]">
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
              {/* Info banner */}
              <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-center">
                <p className="text-xs text-amber-300/90 font-medium uppercase tracking-wider">
                  {circuits.length} Advanced Circuits Available • Click to Add to Toolbar
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {circuits.map((circuit) => (
                  <button
                    key={circuit.id}
                    onClick={() => handleCircuitSelect(circuit)}
                    className="group relative p-5 bg-black/40 hover:bg-black/60 border border-white/10 hover:border-amber-300/30 rounded-xl transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="p-2.5 rounded-lg shadow-lg"
                        style={{ backgroundColor: circuit.color }}
                      >
                        <CircuitBoard className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="absolute top-3 right-3 text-emerald-400 text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Add +
                    </span>

                    <h3 className="text-base font-bold text-white/90 mb-1.5 tracking-wide">
                      {circuit.name}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed">
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
