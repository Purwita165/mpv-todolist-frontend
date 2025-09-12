export interface Todo {
  id: string
  title: string
  completed: boolean
  date?: string
  priority?: "low" | "medium" | "high"
  createdAt: string
  updatedAt: string
}

export interface TodosResponse {
  todos: Todo[]
  totalTodos: number
  hasNextPage: boolean
  nextPage?: number
}

export interface TodosScrollResponse {
  todos: Todo[]
  nextCursor: string | null
  hasNextPage: boolean
}

export interface CreateTodoRequest {
  title: string
  completed?: boolean
  date?: string
  priority?: "low" | "medium" | "high"
}

export interface UpdateTodoRequest {
  title?: string
  completed?: boolean
  date?: string
  priority?: "low" | "medium" | "high"
}

export interface TodoFilters {
  completed?: "all" | "active" | "completed"
  priority?: "low" | "medium" | "high" | "all"
  dateGte?: string
  dateLte?: string
  sort?: "date" | "priority"
  order?: "asc" | "desc"
}

export interface UIState {
  viewMode: "page" | "scroll"
  theme: "light" | "dark"
  showAddModal: boolean
  showNotification: boolean
  notificationMessage: string
}
