"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronDown,
  CircuitBoard,
  ArrowUpDown,
  MoveRight,
  MoveLeft,
  Zap,
  Clock,
  GitBranch,
  Cpu,
  X,
} from "lucide-react";

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

interface ToolbarProps {
  paletteOpen: boolean;
  pendingNode: { type: string; gate?: GateType } | null;
  nextLabelIndex: number;
  GateList: GateType[];
  combinationalCircuits: GateType[];
  onTogglePalette: () => void;
  onPaletteSelect: (type: string, gate?: GateType) => void;
  indexToLabel: (index: number) => string;
}

// Custom Plus icon for Adder
function Plus(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

// Data-driven toolbar configuration with icons
const toolbarConfig = {
  "Logic Gates": {
    type: "gate",
    icon: CircuitBoard,
    items: [
      { name: "AND", icon: ArrowUpDown, color: "#267AB2" },
      { name: "OR", icon: GitBranch, color: "#0D6E52" },
      { name: "NOT", icon: Zap, color: "#8C1F1A" },
      { name: "NAND", icon: CircuitBoard, color: "#5C2D91" },
      { name: "NOR", icon: Cpu, color: "#1F5B70" },
      { name: "XOR", icon: GitBranch, color: "#A65B1F" },
      { name: "XNOR", icon: CircuitBoard, color: "#3F6B2F" },
    ],
  },
  "Input / Output": {
    type: "io",
    icon: ArrowUpDown,
    items: [
      { name: "Input", icon: MoveRight, color: "#4ADE80" },
      { name: "Output", icon: MoveLeft, color: "#F59E0B" },
    ],
  },
  "Combinational Circuits": {
    type: "circuit",
    icon: Cpu,
    items: [],
  },
};

const Toolbar: React.FC<ToolbarProps> = ({
  paletteOpen,
  pendingNode,
  nextLabelIndex,
  GateList,
  combinationalCircuits,
  onTogglePalette,
  onPaletteSelect,
  indexToLabel,
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const dynamicToolbarConfig = {
    "Logic Gates": toolbarConfig["Logic Gates"],
    "Input / Output": toolbarConfig["Input / Output"],
    "Combinational Circuits": {
      type: "circuit",
      icon: Cpu,
      items: combinationalCircuits.map((circuit) => ({
        name: circuit.name,
        color: circuit.color,
        icon: GitBranch,
      })),
    },
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close toolbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toolbarRef.current &&
        !toolbarRef.current.contains(event.target as Node)
      ) {
        setActiveCategory(null);
      }
    };

    if (paletteOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [paletteOpen]);

  const handleCategoryClick = (category: string) => {
    if (isMobile) {
      setActiveCategory(activeCategory === category ? null : category);
    } else {
      setActiveCategory(category);
    }
  };

  const handleCategoryHover = (category: string) => {
    if (!isMobile) {
      setActiveCategory(category);
    }
  };

  const handleItemSelect = (category: string, itemName: string) => {
    const categoryConfig =
      dynamicToolbarConfig[category as keyof typeof dynamicToolbarConfig];

    if (categoryConfig.type === "io") {
      const nodeType = itemName.toLowerCase() === "input" ? "ip" : "op";
      onPaletteSelect("io", {
        id: itemName.toLowerCase(),
        name: itemName,
      } as GateType);
    } else if (categoryConfig.type === "gate") {
      const gate = GateList.find((g) => g.name === itemName);
      if (gate) {
        onPaletteSelect("gate", gate);
      }
    } else if (categoryConfig.type === "circuit") {
      const circ = combinationalCircuits.find((g) => g.name === itemName);
      if (circ) {
        onPaletteSelect("circuit", circ);
      }
      return;
    }

    if (isMobile) {
      setActiveCategory(null);
    }
  };

  const getItemDetails = (category: string, itemName: string) => {
    const categoryConfig =
      dynamicToolbarConfig[category as keyof typeof dynamicToolbarConfig];
    const item = categoryConfig.items.find((item) => item.name === itemName);
    return item || null;
  };

  const isItemActive = (category: string, itemName: string): boolean => {
    const item = getItemDetails(category, itemName);
    if (!item || !pendingNode) return false;

    if (pendingNode.type === "ip" || pendingNode.type === "op") {
      return (
        pendingNode.type === (itemName.toLowerCase() === "input" ? "ip" : "op")
      );
    } else if (pendingNode.type === "gate") {
      return pendingNode.gate?.name === itemName;
    }

    return false;
  };

  const isCombinationalCircuit = (category: string): boolean => {
    return category === "Combinational Circuits";
  };

  // Animation variants with proper TypeScript types
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.2,
      },
    }),
  };

  const dropdownVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2,
      },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.15,
        ease: "easeIn",
      },
    },
  };

  if (!paletteOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-24 sm:top-20 left-6 z-50 flex items-center gap-3"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onTogglePalette}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/85 backdrop-blur transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <CircuitBoard className="w-4 h-4" />
          <span className="text-xs">Toolbar</span>
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={toolbarRef}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="absolute top-24 sm:top-20 left-6 z-50"
    >
      {/* Main Toolbar Button */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onTogglePalette}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-amber-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-amber-300 backdrop-blur transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <X className="w-4 h-4" />
          <span className="text-xs">Close</span>
        </motion.button>
      </div>

      {/* Expanded Toolbar */}
      <motion.div
        layout
        className="absolute top-full left-0 mt-2 w-80 max-w-[85vw] rounded-2xl border border-white/10 bg-[#141414]/95 p-4 text-white shadow-[0_20px_40px_rgba(0,0,0,0.5)] backdrop-blur"
      >
        {/* Next Label Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs uppercase tracking-[0.35em] text-white/70 mb-4 flex items-center justify-between"
        >
          <span>Next label • {indexToLabel(nextLabelIndex)}</span>
          <Clock className="w-3 h-3" />
        </motion.div>

        {/* Categories */}
        <div className="space-y-2">
          {Object.entries(dynamicToolbarConfig).map(
            ([category, config], index) => {
              const CategoryIcon = config.icon;

              return (
                <motion.div
                  key={category}
                  custom={index}
                  variants={itemVariants}
                  className="relative"
                >
                  {/* Category Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => handleCategoryClick(category)}
                    onMouseEnter={() => handleCategoryHover(category)}
                    className={`w-full rounded-lg border px-4 py-3 text-left font-semibold transition-all ${
                      activeCategory === category
                        ? "bg-black/60 ring-2 ring-amber-300 border-amber-300/30"
                        : "border-white/10 bg-black/40 hover:bg-black/60"
                    } `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="w-4 h-4" />
                        <span className="text-sm uppercase tracking-[0.2em]">
                          {category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.span
                          animate={{
                            rotate: activeCategory === category ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="text-xs"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </div>
                    </div>
                  </motion.button>

                  {/* Sub-items Dropdown */}
                  <AnimatePresence>
                    {activeCategory === category && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute left-0 right-0 mt-1 rounded-lg border border-white/10 bg-[#1a1a1a] p-2 shadow-xl z-50 overflow-hidden"
                        onMouseLeave={() =>
                          !isMobile && setActiveCategory(null)
                        }
                      >
                        {category === "Combinational Circuits" &&
                        config.items.length === 0 ? (
                          <div className="text-gray-400 italic px-3 py-2 select-none">
                            Add from library
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {config.items.map((item, itemIndex) => {
                              const ItemIcon = item.icon;
                              const isActive = isItemActive(
                                category,
                                item.name
                              );

                              return (
                                <motion.button
                                  key={item.name}
                                  custom={itemIndex}
                                  initial="hidden"
                                  animate="visible"
                                  variants={itemVariants}
                                  whileHover={{
                                    scale: 1.02,
                                    x: 4,
                                  }}
                                  whileTap={{ scale: 0.98 }}
                                  type="button"
                                  onClick={() =>
                                    handleItemSelect(category, item.name)
                                  }
                                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-all flex items-center justify-between hover:bg-white/10 ${
                                    isActive
                                      ? "bg-amber-500/20 ring-1 ring-amber-300"
                                      : "bg-transparent"
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <ItemIcon className="w-4 h-4" />
                                    <span>{item.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {item.color && (
                                      <div
                                        className="w-3 h-3 rounded-full border border-white/20"
                                        style={{ backgroundColor: item.color }}
                                      />
                                    )}
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }
          )}
        </div>

        {/* Mobile Close Hint */}
        {isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-center text-xs text-white/50 flex items-center justify-center gap-2"
          >
            <span>Tap outside to close</span>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Toolbar;
