"use client";
import Loader from "./Loader";
import { useState } from "react";

interface Props {
  label?: string;
}

export function LoaderButton({ label }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <>
      {loading && <Loader />}
      <button
        onClick={() => {
          setLoading(true);
        }}
        className="mt-10 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-black font-bold text-2xl shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.6)] hover:scale-105 transition-all duration-300"
      >
        {label}
      </button>
    </>
  );
}
