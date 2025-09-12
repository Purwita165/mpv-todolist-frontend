import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query"
import { apiClient } from "../api"
import type { Todo, CreateTodoRequest, UpdateTodoRequest, TodoFilters } from "../types"
import { useAppDispatch } from "../store"
import { showNotification } from "../store/slices/uiSlice"

export const useTodos = (filters: TodoFilters & { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ["todos", filters],
    queryFn: () => apiClient.getTodos(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useTodosInfinite = (filters: TodoFilters & { limit?: number }) => {
  return useInfiniteQuery({
    queryKey: ["todos-infinite", filters],
    queryFn: ({ pageParam }) => apiClient.getTodosScroll({ ...filters, nextCursor: pageParam }),
    initialPageParam: "0",
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.nextCursor : undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreateTodo = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (data: CreateTodoRequest) => {
      console.log("[v0] Creating todo with data:", data)
      return apiClient.createTodo(data)
    },
    onMutate: async (newTodo) => {
      console.log("[v0] Optimistic update for new todo:", newTodo)
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      await queryClient.cancelQueries({ queryKey: ["todos-infinite"] })

      const optimisticTodo: Todo = {
        id: `temp-${Date.now()}`,
        title: newTodo.title,
        completed: newTodo.completed || false,
        date: newTodo.date,
        startDate: newTodo.startDate,
        priority: newTodo.priority,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Update infinite query cache
      queryClient.setQueryData(["todos-infinite"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any, index: number) =>
            index === 0 ? { ...page, todos: [optimisticTodo, ...page.todos] } : page,
          ),
        }
      })

      return { optimisticTodo }
    },
    onSuccess: (data, variables, context) => {
      console.log("[v0] Todo created successfully:", data)
      dispatch(showNotification("Task Added!"))
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
    },
    onError: (error, variables, context) => {
      console.error("[v0] Failed to create todo:", error)
      // Rollback optimistic update
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
      dispatch(showNotification("Failed to add task"))
    },
  })
}

export const useUpdateTodo = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) => {
      console.log("[v0] Updating todo:", id, "with data:", data)
      return apiClient.updateTodo(id, data)
    },
    onMutate: async ({ id, data }) => {
      console.log("[v0] Optimistic update for todo:", id, data)
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      await queryClient.cancelQueries({ queryKey: ["todos-infinite"] })

      // Optimistic update
      queryClient.setQueryData(["todos-infinite"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            todos: page.todos.map((todo: Todo) =>
              todo.id === id ? { ...todo, ...data, updatedAt: new Date().toISOString() } : todo,
            ),
          })),
        }
      })
    },
    onSuccess: (data) => {
      console.log("[v0] Todo updated successfully:", data)
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
    },
    onError: (error) => {
      console.error("[v0] Failed to update todo:", error)
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
      dispatch(showNotification("Failed to update task"))
    },
  })
}

export const useDeleteTodo = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTodo(id),
    onMutate: async (id) => {
      console.log("[v0] Optimistic update for deleting todo:", id)
      await queryClient.cancelQueries({ queryKey: ["todos"] })
      await queryClient.cancelQueries({ queryKey: ["todos-infinite"] })

      // Optimistic update
      queryClient.setQueryData(["todos-infinite"], (old: any) => {
        if (!old) return old
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            todos: page.todos.filter((todo: Todo) => todo.id !== id),
          })),
        }
      })
    },
    onSuccess: () => {
      dispatch(showNotification("Task deleted!"))
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
    },
    onError: () => {
      console.error("[v0] Failed to delete todo")
      queryClient.invalidateQueries({ queryKey: ["todos"] })
      queryClient.invalidateQueries({ queryKey: ["todos-infinite"] })
      dispatch(showNotification("Failed to delete task"))
    },
  })
}
