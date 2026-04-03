"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type ThemeName = 
  | "default"    // Teal & Cream (original)
  | "ocean"      // Blue ocean vibes
  | "forest"     // Green nature theme
  | "candy"      // Pink & purple sweet theme
  | "space"      // Dark purple cosmic theme
  | "sunset"     // Orange & warm tones
  | "arctic"     // Cool blue & white

interface ThemeContextType {
  theme: ThemeName
  setTheme: (theme: ThemeName) => void
  themes: { name: ThemeName; label: string; preview: string[]; icon: string }[]
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const themes: { name: ThemeName; label: string; preview: string[]; icon: string }[] = [
  { name: "default", label: "Teal Dream", preview: ["#2DD4BF", "#FFF7ED", "#FBBF24"], icon: "sparkles" },
  { name: "ocean", label: "Ocean Adventure", preview: ["#3B82F6", "#DBEAFE", "#06B6D4"], icon: "waves" },
  { name: "forest", label: "Forest Friends", preview: ["#22C55E", "#DCFCE7", "#84CC16"], icon: "trees" },
  { name: "candy", label: "Candy Land", preview: ["#EC4899", "#FDF2F8", "#A855F7"], icon: "candy" },
  { name: "space", label: "Space Explorer", preview: ["#8B5CF6", "#1E1B4B", "#F472B6"], icon: "rocket" },
  { name: "sunset", label: "Sunset Safari", preview: ["#F97316", "#FFF7ED", "#EF4444"], icon: "sun" },
  { name: "arctic", label: "Arctic Chill", preview: ["#06B6D4", "#F0F9FF", "#0EA5E9"], icon: "snowflake" },
]

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("default")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("atutori-theme") as ThemeName | null
    if (savedTheme && themes.some(t => t.name === savedTheme)) {
      setThemeState(savedTheme)
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])

  const setTheme = (newTheme: ThemeName) => {
    setThemeState(newTheme)
    localStorage.setItem("atutori-theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme, setTheme, themes }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
