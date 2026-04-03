"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useTheme, themes, type ThemeName } from "./theme-provider"
import {
  Sparkles,
  Waves,
  TreePine,
  Candy,
  Rocket,
  Sun,
  Snowflake,
  Palette,
  Check,
} from "lucide-react"

const iconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles className="h-5 w-5" />,
  waves: <Waves className="h-5 w-5" />,
  trees: <TreePine className="h-5 w-5" />,
  candy: <Candy className="h-5 w-5" />,
  rocket: <Rocket className="h-5 w-5" />,
  sun: <Sun className="h-5 w-5" />,
  snowflake: <Snowflake className="h-5 w-5" />,
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)

  const handleSelectTheme = (themeName: ThemeName) => {
    setTheme(themeName)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/20 h-8 w-8"
          title="Change Theme"
        >
          <Palette className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Choose Your Theme
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {themes.map((t) => (
            <Card
              key={t.name}
              className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                theme === t.name
                  ? "ring-2 ring-primary ring-offset-2"
                  : "hover:shadow-md"
              }`}
              onClick={() => handleSelectTheme(t.name)}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: t.preview[1] }}
                >
                  <div style={{ color: t.preview[0] }}>
                    {iconMap[t.icon]}
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{t.label}</p>
                  <div className="flex gap-1 mt-1">
                    {t.preview.map((color, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {theme === t.name && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Compact version for mobile or inline use
export function ThemeSelectorCompact() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`p-2 rounded-xl transition-all ${
            theme === t.name
              ? "ring-2 ring-primary ring-offset-2 scale-110"
              : "hover:scale-105"
          }`}
          style={{ backgroundColor: t.preview[1] }}
          title={t.label}
        >
          <div style={{ color: t.preview[0] }}>
            {iconMap[t.icon]}
          </div>
        </button>
      ))}
    </div>
  )
}
