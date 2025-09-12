"use client"

import { Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/lib/store"
import { setTheme } from "@/lib/store/slices/uiSlice"

export function ThemeToggle() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.ui.theme)

  const toggleTheme = () => {
    dispatch(setTheme(theme === "dark" ? "light" : "dark"))
  }

  return (
    <div className="flex items-center gap-1 bg-gray-800 dark:bg-gray-800 rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`h-8 w-8 p-0 ${
          theme === "light"
            ? "bg-white text-gray-900 hover:bg-gray-100"
            : "text-gray-400 hover:text-white hover:bg-gray-700"
        }`}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className={`h-8 w-8 p-0 ${
          theme === "dark"
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
