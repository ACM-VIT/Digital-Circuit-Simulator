"use client";
import React from "react";
import Image from "next/image";
import D from "@/public/logic-gate-or-svgrepo-com.svg";
import cir from "@/public/8bvaKz01 (1).svg";
import Link from "next/link";
import { User, LogIn } from 'lucide-react';
// import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
// import UserSync from '@/components/UserSync';
import { useState } from "react";
import Loader from "@/components/Loader";

export default function Home() {
  // Temporarily disabled Clerk
  // const { user, isLoaded } = useUser();
  const user = null; // Mock user for testing
  const isLoaded = true;
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#1b1c1d] flex flex-col relative overflow-hidden">
      {loading && <Loader />}
      {/* Auto-sync user with database when authenticated */}
      {/* <UserSync /> */}
      {/* Header with Auth */}
      <div className="absolute top-6 right-6 z-10">
        {isLoaded && user ? (
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button 
                onClick={() => setLoading(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 hover:bg-blue-500/30 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Dashboard</span>
              </button>
            </Link>
            <Link href="/circuit">
              <button 
                onClick={() => setLoading(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Simulator</span>
              </button>
            </Link>
            {/* <UserButton afterSignOutUrl="/" /> */}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Temporarily disabled Clerk auth buttons */}
            {/* <SignInButton mode="modal">
              <button className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-full text-white/90 hover:bg-white/10 transition-colors">
                <LogIn className="w-4 h-4" />
                <span className="text-sm font-medium">Sign In</span>
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 hover:bg-emerald-500/30 transition-colors">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Up</span>
              </button>
            </SignUpButton> */}
            <Link href="/circuit">
              <button 
                onClick={() => setLoading(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 hover:bg-emerald-500/30 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Try Now</span>
              </button>
            </Link>
          </div>
        )}
      </div>

      <div className="flex flex-col justify-center items-center h-[92vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-center text-center mb-6 z-10 gap-2 sm:gap-3">
          <div className="flex flex-row items-center gap-0">
            <Image
              src={D}
              alt="Logic Gate"
              className="h-20 sm:h-32 lg:h-36 w-auto animate-pulse flex-shrink-0 object-contain"
            />
            <h1 className="text-emerald-600 text-5xl sm:text-6xl lg:text-7xl font-extrabold drop-shadow-[0_0_10px_rgba(0,255,157,0.3)]">
              igital{" "}
            </h1>
          </div>

          <h1 className="text-emerald-600 text-5xl sm:text-6xl lg:text-7xl font-extrabold drop-shadow-[0_0_10px_rgba(0,255,157,0.3)]">
            Circuit Simulator
          </h1>
        </div>

        <p className="text-gray-300 text-center text-lg sm:text-xl lg:text-2xl max-w-2xl mb-8 leading-relaxed z-10">
          Build, test, and analyze your digital circuits virtually — no
          breadboard required.
        </p>

        <div className="relative z-10">
          <Image
            src={cir}
            alt="Circuit illustration"
            className="h-[30vh] drop-shadow-[0_0_25px_rgba(0,255,157,0.4)] hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        <Link href="/circuit" className="z-10">
          <button
            onClick={() => setLoading(true)}
            className="mt-10 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-black font-bold text-2xl shadow-[0_0_20px_rgba(0,255,157,0.3)] hover:shadow-[0_0_40px_rgba(0,255,157,0.6)] hover:scale-105 transition-all duration-300"
          >
            Try it Out!
          </button>
        </Link>
      </div>

      {/* About Section */}
      <section className="bg-[#141515] py-20 px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-emerald-500 mb-6 drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]">
          About the Project
        </h2>
        <p className="max-w-3xl mx-auto text-gray-300 text-lg sm:text-xl leading-relaxed">
          The{" "}
          <span className="text-emerald-400 font-semibold">
            Digital Circuit Simulator{" "}
          </span>
          is an interactive learning platform designed to make digital
          electronics accessible and engaging. Built with modern web
          technologies, it offers a seamless drag-and-drop interface that lets
          you visualize, connect, and test digital logic components — all within
          your browser.
        </p>
      </section>

      {/* Core Features Section */}
      <section className="bg-black py-20 px-8">
        <h2 className="text-4xl sm:text-5xl font-extrabold text-center text-emerald-500 mb-12 drop-shadow-[0_0_8px_rgba(0,255,157,0.3)]">
          Core Features
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 text-center">
          <div className="p-6 rounded-xl bg-[#1f1f1f] hover:bg-[#242424] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,157,0.1)] flex flex-col justify-center items-center min-h-[220px]">
            <h3 className="text-emerald-400 text-2xl font-semibold mb-2">
              Logic Gate Design
            </h3>
            <p className="text-gray-300 text-base">
              Build circuits visually using AND, OR, NOT, NAND, NOR, XOR, and
              XNOR gates.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#1f1f1f] hover:bg-[#242424] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,157,0.1)] flex flex-col justify-center items-center min-h-[220px]">
            <h3 className="text-emerald-400 text-2xl font-semibold mb-2">
              Interactive Connections
            </h3>
            <p className="text-gray-300 text-base">
              Connect components with dynamic wires and handles.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#1f1f1f] hover:bg-[#242424] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,157,0.1)] flex flex-col justify-center items-center min-h-[220px]">
            <h3 className="text-emerald-400 text-2xl font-semibold mb-2">
              Live Testing
            </h3>
            <p className="text-gray-300 text-base">
              Observe instant changes in output as you toggle input switches and
              test your logic.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#1f1f1f] hover:bg-[#242424] transition-all duration-300 shadow-[0_0_15px_rgba(0,255,157,0.1)] flex flex-col justify-center items-center min-h-[220px]">
            <h3 className="text-emerald-400 text-2xl font-semibold mb-2">
              Browser-Based
            </h3>
            <p className="text-gray-300 text-base">
              No installations or hardware setup — experiment directly from your
              web browser.
            </p>
          </div>
        </div>
      </section>

      {/* Subtle footer glow */}
      <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#00ff9d1a] to-transparent"></div>
    </div>
  );
}
