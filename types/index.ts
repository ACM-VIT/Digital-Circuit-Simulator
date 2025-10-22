export interface GateType {
  id: string;
  color: string;
  name: string;
  inputs?: string[];
  outputs: { [key: string]: string };
  circuit?: { gates: GateType[]; wires: Wire[] };
}

export interface Wire {
  source: string;
  target: string;
}

export interface PendingNode {
  type: string;
  gate?: GateType;
}

export interface MousePosition {
  x: number;
  y: number;
}

export interface CircuitState {
  nodes: any[];
  edges: any[];
  inputValues: { [key: string]: boolean };
  outputValues: { [key: string]: boolean };
  paletteOpen: boolean;
  pendingNode: PendingNode | null;
  nextLabelIndex: number;
}
