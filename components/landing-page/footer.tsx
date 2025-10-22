"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "@/components/theme-provider"
import { useState, useEffect } from "react"

export default function Footer() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <footer className="container py-8 border-t border-gray-800">
      <div className="flex flex-col items-center text-center">
        <Link href="/" className="flex items-center justify-center mb-4">
          {mounted ? (
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
          ) : (
            <div className="h-12 w-[200px]" />
          )}
        </Link>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
          Interactive Digital Logic Circuit Simulator
        </p>

        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} Digital Circuit Simulator. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
