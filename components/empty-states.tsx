"use client"

import { Button } from "@/components/ui/button"
import { Plus, Filter, RefreshCw } from "lucide-react"

interface EmptyStateProps {
  type: "no-tasks" | "no-search-results" | "no-filter-results" | "error"
  theme: "light" | "dark"
  searchQuery?: string
  onAddTask?: () => void
  onClearFilters?: () => void
  onRetry?: () => void
  errorMessage?: string
}

export function EmptyState({
  type,
  theme,
  searchQuery,
  onAddTask,
  onClearFilters,
  onRetry,
  errorMessage,
}: EmptyStateProps) {
  const getEmptyStateContent = () => {
    switch (type) {
      case "no-tasks":
        return {
          icon: "📝",
          title: "No tasks yet",
          description: "Create your first task to get started with your productivity journey.",
          action: onAddTask && (
            <Button onClick={onAddTask} className="bg-blue-600 hover:bg-blue-700 text-white mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Task
            </Button>
          ),
        }

      case "no-search-results":
        return {
          icon: "🔍",
          title: "No matching tasks",
          description: `No tasks found matching "${searchQuery}". Try adjusting your search terms.`,
          action: null,
        }

      case "no-filter-results":
        return {
          icon: "🔽",
          title: "No tasks match your filters",
          description: "Try adjusting your filters or create a new task that matches your criteria.",
          action: onClearFilters && (
            <Button
              onClick={onClearFilters}
              variant="outline"
              className={`mt-4 ${
                theme === "dark"
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          ),
        }

      case "error":
        return {
          icon: "⚠️",
          title: "Something went wrong",
          description: errorMessage || "Failed to load tasks. Please try again.",
          action: onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              className={`mt-4 ${
                theme === "dark"
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          ),
        }

      default:
        return {
          icon: "📝",
          title: "No tasks",
          description: "No tasks to display.",
          action: null,
        }
    }
  }

  const content = getEmptyStateContent()

  return (
    <div className="px-6 py-12 text-center">
      <div className={`text-6xl mb-4 ${theme === "dark" ? "text-gray-700" : "text-gray-300"}`}>{content.icon}</div>
      <h3 className={`text-lg font-medium mb-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {content.title}
      </h3>
      <p className={`text-sm max-w-md mx-auto ${theme === "dark" ? "text-gray-500" : "text-gray-500"}`}>
        {content.description}
      </p>
      {content.action}
    </div>
  )
}
