"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/");
  };



  return (
    <>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
        <div className={`mx-auto max-w-7xl rounded-2xl shadow-lg transition-all duration-300 ${isScrolled
            ? "bg-[#111111]/95 backdrop-blur-md shadow-xl"
            : "bg-[#111111] shadow-md"
          }`}>
          <header className="relative">
            <div className="flex items-center justify-between px-6 py-4">
              <Link
                href="/"
                className="flex items-center space-x-3"
                onClick={handleLogoClick}
              >
                {mounted ? (
                  <>
                    <div className="text-2xl font-bold flex items-center gap-3 text-white">
                      <Image
                        src={"/logic-gate-or-svgrepo-com.svg"}
                        alt="Digital Circuit Logo"
                        width={40}
                        height={40}
                        className="h-10 w-10"
                        priority
                      />
                      Digital Circuit Simulator
                    </div>
                  </>
                ) : (
                  <div className="h-10 w-[180px]" />
                )}
              </Link>

              <nav className="hidden lg:flex items-center space-x-8">
                {/* {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      item.active
                        ? "text-[#7A7FEE] border-b-2 border-[#7A7FEE] pb-1"
                        : "text-gray-300 hover:text-[#7A7FEE]"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))} */}
              </nav>

              <div className="flex items-center space-x-4">

                <div className="hidden md:flex items-center space-x-3">
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-300 hover:text-[#7A7FEE] transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="bg-[#7A7FEE] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#6B73E8] transition-colors shadow-sm"
                  >
                    Register
                  </Link>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5 text-gray-300" />
                </button>
              </div>
            </div>
          </header>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-[#111111] shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#7A7FEE] to-[#6B73E8] rounded-full flex items-center justify-center">
                    <Image
                      src={"/logic-gate-or-svgrepo-com.svg"}
                      alt="Digital Circuit Logo"
                      width={20}
                      height={20}
                      className="h-5 w-5 text-white filter brightness-0 invert"
                    />
                  </div>
                  <span className="text-lg font-bold text-white">
                    Digital Circuit
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-300" />
                </button>
              </div>

              <nav className="flex-1 px-6 py-6 space-y-4">

              </nav>

              <div className="p-6 border-t border-gray-700 space-y-3">
                <Link
                  href="/login"
                  className="block w-full text-center py-3 text-sm font-medium text-gray-300 hover:text-[#7A7FEE] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="block w-full text-center py-3 bg-[#7A7FEE] text-white rounded-lg text-sm font-medium hover:bg-[#6B73E8] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
