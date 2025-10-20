import React from "react";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-16 h-16">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-ping"></div>

        {/* Inner spinning ring */}
        <div className="absolute inset-0 border-4 border-t-emerald-400 border-transparent rounded-full animate-spin"></div>

        {/* Center pulse */}
        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      </div>
    </div>
  );
}
