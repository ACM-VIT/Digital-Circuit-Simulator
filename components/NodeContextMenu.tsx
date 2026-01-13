"use client";

import { Copy, Trash2, Edit3, Hash } from "lucide-react";
import { useEffect, useRef } from "react";

type NodeContextMenuProps = {
  x: number;
  y: number;
  onDuplicate: () => void;
  onDelete: () => void;
  onRename: () => void;
  onCopy: () => void;
  onClose: () => void;
  selectedCount?: number;
  onChangeInputs?: () => void;
  isLogicGate?: boolean;
};

export function NodeContextMenu({
  x,
  y,
  onDuplicate,
  onDelete,
  onRename,
  onCopy,
  onClose,
  selectedCount = 1,
  onChangeInputs,
  isLogicGate = false,
}: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-[9999] min-w-[180px] rounded-lg border border-white/10 bg-[#0f1115] shadow-2xl backdrop-blur-sm"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      <div className="py-1">
        {selectedCount > 1 && (
          <div className="px-4 py-2 text-xs text-gray-400 border-b border-white/10">
            {selectedCount} nodes selected
          </div>
        )}
        {selectedCount === 1 && (
          <button
            onClick={() => {
              onRename();
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            <Edit3 className="h-4 w-4 text-blue-400" />
            <span>Rename</span>
          </button>
        )}
        {selectedCount === 1 && isLogicGate && onChangeInputs && (
          <button
            onClick={() => {
              onChangeInputs();
              onClose();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-white/10"
          >
            <Hash className="h-4 w-4 text-purple-400" />
            <span>Change Inputs</span>
          </button>
        )}
        <button
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-white/10"
        >
          <Copy className="h-4 w-4 text-yellow-400" />
          <span>Copy</span>
        </button>
        <button
          onClick={() => {
            onDuplicate();
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-200 transition-colors hover:bg-white/10"
        >
          <Copy className="h-4 w-4 text-green-400" />
          <span>Duplicate</span>
        </button>
        <div className="my-1 h-px bg-white/10" />
        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/20"
        >
          <Trash2 className="h-4 w-4" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
