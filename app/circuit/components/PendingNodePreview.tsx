"use client";

import React from "react";
import { PendingNode, MousePosition } from "@/types";

interface PendingNodePreviewProps {
  pendingNode: PendingNode | null;
  mousePos: MousePosition | null;
}

export default function PendingNodePreview({ pendingNode, mousePos }: PendingNodePreviewProps) {
  if (!pendingNode || !mousePos) {
    return null;
  }

  return (
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
  );
}
