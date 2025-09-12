"use client"

import { Card } from "@/components/ui/card"

interface LoadingSkeletonProps {
  theme: "light" | "dark"
  count?: number
}

export function LoadingSkeleton({ theme, count = 4 }: LoadingSkeletonProps) {
  const cardClasses = theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
  const skeletonClasses = theme === "dark" ? "bg-gray-800" : "bg-gray-200"

  return (
    <div className="px-6 space-y-3 mb-6">
      <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
        {[...Array(count)].map((_, i) => (
          <Card key={i} className={`${cardClasses} p-4`}>
            <div className="flex items-start gap-3">
              <div className={`w-4 h-4 rounded ${skeletonClasses} animate-pulse mt-1`} />
              <div className="flex-1">
                <div className={`h-4 rounded mb-2 ${skeletonClasses} animate-pulse`} />
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-20 rounded ${skeletonClasses} animate-pulse`} />
                  <div className={`h-5 w-12 rounded ${skeletonClasses} animate-pulse`} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-8 h-8 rounded ${skeletonClasses} animate-pulse`} />
                <div className={`w-8 h-8 rounded ${skeletonClasses} animate-pulse`} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
