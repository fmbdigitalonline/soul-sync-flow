import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  size?: "default" | "sm" | "lg" | "icon"
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className, 
  size = "icon" 
}) => {
  const [isDark, setIsDark] = React.useState(false)

  React.useEffect(() => {
    // Check initial theme state
    const isDarkMode = document.documentElement.classList.contains('dark')
    setIsDark(isDarkMode)
  }, [])

  const toggleTheme = React.useCallback(() => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    
    // Toggle dark class on html element
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  React.useEffect(() => {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme')
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark)
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={toggleTheme}
      className={cn(
        "transition-transform hover:scale-110 active:scale-95",
        className
      )}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-all" />
      ) : (
        <Moon className="h-4 w-4 transition-all" />
      )}
      <span className="sr-only">
        {isDark ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </Button>
  )
}