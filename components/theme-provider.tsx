"use client"

import { createContext, useContext, useEffect, useState } from "react"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: "dark"
  resolvedTheme: "dark"
}

const initialState: ThemeProviderState = {
  theme: "dark",
  resolvedTheme: "dark",
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Always set dark mode
    const root = window.document.documentElement
    root.classList.remove("light")
    root.classList.add("dark")
  }, [])

  const value = {
    theme: "dark" as const,
    resolvedTheme: "dark" as const,
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}
