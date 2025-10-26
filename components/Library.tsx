"use client";

import { useState } from "react";
import { CircuitBoard, X } from "lucide-react";

export default function Library() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute top-6 left-6 flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.4em] text-white/85 backdrop-blur transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
        >
          <CircuitBoard className="w-4 h-4" />
          <span className="text-xs">Library</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center ">
          <div className="relative w-full max-w-4xl max-h-[80vh] m-4 bg-[#353536] rounded-lg shadow-2xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <CircuitBoard className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white/90 tracking-wide">
                  Circuit Library
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
              >
                <X className="w-5 h-5 text-white/70" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <p className="text-white/60 text-center">
                Library content will go here
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
