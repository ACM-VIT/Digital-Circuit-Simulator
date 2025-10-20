"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import D from "@/public/logic-gate-or-svgrepo-com.svg";
import cir from "@/public/8bvaKz01 (1).svg";
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";
import Loader from "@/components/Loader";
import { useState } from "react";
import { loadBindings } from "next/dist/build/swc";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="relative min-h-screen bg-[#0f0f0f] flex flex-col overflow-hidden text-white">
      {loading && <Loader />}

      {/* --- Animated Background Layers --- */}
      <FlickeringGrid
        className="absolute inset-0"
        squareSize={10}
        gridGap={10}
        flickerChance={0.5}
        color="rgba(0, 255, 157, 0.2)"
        maxOpacity={0.2}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,157,0.08),transparent_70%)] blur-3xl" />

      {/* --- Hero Section --- */}
      <div className="relative z-10 flex flex-col justify-center items-center h-screen px-4">
        <motion.div
          initial={{ opacity: 0.5, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center text-center mb-6 gap-2 sm:gap-3"
        >
          <div className="flex flex-row items-center gap-0">
            <Image
              src={D}
              alt="Logic Gate"
              className="h-20 sm:h-32 lg:h-36 w-auto animate-pulse flex-shrink-0 object-contain"
            />
            <h1 className="text-emerald-500 text-5xl sm:text-6xl lg:text-7xl font-extrabold drop-shadow-[0_0_15px_rgba(0,255,157,0.3)]">
              igital{" "}
            </h1>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent animate-[textflow_6s_linear_infinite]">
            Circuit Simulator
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-gray-300 text-center text-lg sm:text-xl lg:text-2xl max-w-2xl mb-8 leading-relaxed"
        >
          Build, test, and analyze your digital circuits virtually — no
          breadboard required.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative"
        >
          <Image
            src={cir}
            alt="Circuit illustration"
            className="h-[30vh] drop-shadow-[0_0_30px_rgba(0,255,157,0.5)] transition-transform duration-500"
          />
        </motion.div>

        <Link href="/circuit" className="relative mt-10 group">
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => {
              setLoading(true);
            }}
            className="button-glow relative overflow-hidden px-10 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-black font-bold text-2xl shadow-[0_0_25px_rgba(0,255,157,0.3)] transition-all duration-300"
          >
            <span className="relative z-10">Try it out!</span>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
          </motion.button>
        </Link>
      </div>

      {/* --- About Section --- */}
      <section className="relative bg-[#141515] py-20 px-8 text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold text-emerald-400 mb-6 drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]">
            About the Project
          </h2>
          <p className="max-w-3xl mx-auto text-gray-300 text-lg sm:text-xl leading-relaxed">
            The{" "}
            <span className="text-emerald-400 font-semibold">
              Digital Circuit Simulator
            </span>{" "}
            is an interactive learning platform designed to make digital
            electronics accessible and engaging. Built with modern web
            technologies, it offers a seamless drag-and-drop interface that lets
            you visualize, connect, and test digital logic components — all
            within your browser.
          </p>
        </motion.div>
      </section>

      {/* --- Core Features --- */}
      <section className="bg-black py-20 px-8">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-extrabold text-center text-emerald-500 mb-12 drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]"
        >
          Core Features
        </motion.h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-10 text-center">
          {[
            {
              title: "Logic Gate Design",
              desc: "Build circuits visually using AND, OR, NOT, NAND, NOR, XOR, and XNOR gates.",
            },
            {
              title: "Interactive Connections",
              desc: "Connect components with dynamic wires and handles.",
            },
            {
              title: "Live Testing",
              desc: "Observe instant output changes as you toggle input switches.",
            },
            {
              title: "Browser-Based",
              desc: "Experiment directly from your web browser — no installations needed.",
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="group relative p-6 rounded-xl bg-[#1f1f1f] hover:bg-[#242424] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,157,0.1)] hover:shadow-[0_0_25px_rgba(0,255,157,0.3)] flex flex-col justify-center items-center min-h-[220px] overflow-hidden"
            >
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h3 className="text-emerald-400 text-2xl font-semibold mb-2">
                {f.title}
              </h3>
              <p className="text-gray-300 text-base">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- Footer Glow --- */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#00ff9d1a] to-transparent animate-[footerPulse_4s_ease-in-out_infinite]" />
    </div>
  );
}
