"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThemeToggleProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-6 right-6 z-50 rounded-full w-12 h-12 shadow-lg group bg-background/80 backdrop-blur-sm"
    >
      <div className="transition-transform duration-500 ease-in-out group-hover:rotate-[360deg]">
        {theme === 'light' ? (
          <Moon className="h-6 w-6 text-primary" />
        ) : (
          <Sun className="h-6 w-6 text-yellow-400" />
        )}
      </div>
    </Button>
  )
}
