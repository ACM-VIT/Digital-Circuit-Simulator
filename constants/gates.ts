import { GateType } from "@/types";

export const GateList: GateType[] = [
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

export const proOptions = { hideAttribution: true };
