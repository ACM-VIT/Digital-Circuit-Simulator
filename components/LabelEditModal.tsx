"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type LabelEditModalProps = {
  open: boolean;
  currentLabel: string;
  nodeType: "input" | "output" | "gate";
  onSave: (newLabel: string) => void;
  onClose: () => void;
};

export function LabelEditModal({
  open,
  currentLabel,
  nodeType,
  onSave,
  onClose,
}: LabelEditModalProps) {
  const [label, setLabel] = useState(currentLabel);

  useEffect(() => {
    setLabel(currentLabel);
  }, [currentLabel, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
      if (e.key === "Enter" && open) handleSave();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, label]);

  const handleSave = () => {
    if (label.trim()) {
      onSave(label.trim());
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115] p-6 shadow-2xl">
          <button
            aria-label="Close label edit modal"
            className="absolute top-3 right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-white">
                Edit {nodeType === "gate" ? "Gate" : nodeType === "input" ? "Input" : "Output"} Label
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Double-click to edit labels anytime
              </p>
            </div>

            <div>
              <label
                htmlFor="label-input"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Label
              </label>
              <input
                id="label-input"
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#1b1d22] px-4 py-2.5 text-white placeholder:text-gray-500 focus:border-[#7A7FEE] focus:outline-none focus:ring-2 focus:ring-[#7A7FEE]/20"
                placeholder="Enter label"
                autoFocus
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                {label.length}/20 characters
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!label.trim()}
                className="rounded-lg bg-[#7A7FEE] px-4 py-2 text-sm font-medium text-white hover:bg-[#6B73E8] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Label
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
