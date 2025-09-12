"use client"

import type React from "react"

import { Provider } from "react-redux"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { store } from "@/lib/store"
import { useState } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            retry: 3,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 1,
          },
        },
      }),
  )

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  )
}
