import type {
  Todo,
  TodosResponse,
  TodosScrollResponse,
  TodoFilters,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://be-todolist.vercel.app";

const MOCK_TODOS: Todo[] = [
  {
    id: "1",
    title: "Practice about Frontend Developer",
    completed: false,
    date: "2025-01-15",
    startDate: "2025-01-10",
    priority: "low",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "2",
    title: "Complete JavaScript Algorithms",
    completed: false,
    date: "2025-02-12",
    startDate: "2025-01-15",
    priority: "medium",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "3",
    title: "Build a Responsive Website",
    completed: false,
    date: "2025-03-20",
    startDate: "2025-02-01",
    priority: "high",
    createdAt: "2025-01-10T00:00:00Z",
    updatedAt: "2025-01-10T00:00:00Z",
  },
  {
    id: "4",
    title: "Explore CSS Frameworks",
    completed: true,
    date: "2025-01-15",
    startDate: "2025-01-05",
    priority: "low",
    createdAt: "2025-01-05T00:00:00Z",
    updatedAt: "2025-01-15T00:00:00Z",
  },
];

interface CreateTodoRequest {
  title: string;
  completed?: boolean;
  date?: string;
  priority?: "low" | "medium" | "high";
  startDate?: string;
}

interface UpdateTodoRequest {
  title?: string;
  completed?: boolean;
  date?: string;
  priority?: "low" | "medium" | "high";
  startDate?: string;
}

class ApiClient {
  private useMockData = false;

  private filterMockTodos(filters: TodoFilters): Todo[] {
    let filtered = [...MOCK_TODOS];

    if (filters.completed && filters.completed !== "all") {
      const isCompleted = filters.completed === "completed";
      filtered = filtered.filter((todo) => todo.completed === isCompleted);
    }

    if (filters.priority && filters.priority !== "all") {
      filtered = filtered.filter((todo) => todo.priority === filters.priority);
    }

    if (filters.dateGte) {
      filtered = filtered.filter(
        (todo) => todo.date && todo.date >= filters.dateGte!
      );
    }

    if (filters.dateLte) {
      filtered = filtered.filter(
        (todo) => todo.date && todo.date <= filters.dateLte!
      );
    }

    // Sort by date or priority
    if (filters.sort === "date") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.date || "").getTime();
        const dateB = new Date(b.date || "").getTime();
        return filters.order === "asc" ? dateA - dateB : dateB - dateA;
      });
    } else if (filters.sort === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      filtered.sort((a, b) => {
        const priorityA = priorityOrder[a.priority || "low"];
        const priorityB = priorityOrder[b.priority || "low"];
        return filters.order === "asc"
          ? priorityA - priorityB
          : priorityB - priorityA;
      });
    }

    return filtered;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    console.log("[API] Request:", {
      url,
      method: options?.method || "GET",
      body: options?.body,
    });

    try {
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[API] Error Response:", errorText);
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("[API] Response Data:", data);
      return data;
    } catch (error) {
      console.error("[API] Request Failed:", error);
      this.useMockData = true; // fallback
      throw new Error("BACKEND_UNAVAILABLE");
    }
  }

  async getTodos(
    params: { page?: number; limit?: number } & TodoFilters = {}
  ): Promise<TodosResponse> {
    if (this.useMockData) {
      const filtered = this.filterMockTodos(params);
      const page = params.page || 1;
      const limit = params.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedTodos = filtered.slice(startIndex, endIndex);

      return {
        todos: paginatedTodos,
        totalTodos: filtered.length,
        hasNextPage: endIndex < filtered.length,
        nextPage: endIndex < filtered.length ? page + 1 : null,
      };
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        searchParams.append(key, value.toString());
      }
    });

    return await this.request<TodosResponse>(
      `/todos?${searchParams.toString()}`
    );
  }

  async getTodosScroll(
    params: { nextCursor?: string; limit?: number } & TodoFilters = {}
  ): Promise<TodosScrollResponse> {
    if (this.useMockData) {
      const filtered = this.filterMockTodos(params);
      const limit = params.limit || 10;
      const cursor = Number.parseInt(params.nextCursor || "0");
      const startIndex = cursor;
      const endIndex = startIndex + limit;
      const paginatedTodos = filtered.slice(startIndex, endIndex);

      return {
        todos: paginatedTodos,
        nextCursor: endIndex < filtered.length ? endIndex.toString() : null,
        hasNextPage: endIndex < filtered.length,
      };
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "all") {
        searchParams.append(key, value.toString());
      }
    });

    return await this.request<TodosScrollResponse>(
      `/todos/scroll?${searchParams.toString()}`
    );
  }

  async createTodo(data: CreateTodoRequest): Promise<Todo> {
    if (this.useMockData) {
      const newTodo: Todo = {
        id: Date.now().toString(),
        title: data.title,
        completed: data.completed || false,
        date: data.date || new Date().toISOString().split("T")[0],
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        priority: data.priority || "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      MOCK_TODOS.unshift(newTodo);
      return newTodo;
    }

    return await this.request<Todo>("/todos", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateTodo(id: string, data: UpdateTodoRequest): Promise<Todo> {
    if (this.useMockData) {
      const todoIndex = MOCK_TODOS.findIndex((todo) => todo.id === id);
      if (todoIndex === -1) {
        throw new Error("Todo not found");
      }
      const updatedTodo = {
        ...MOCK_TODOS[todoIndex],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      MOCK_TODOS[todoIndex] = updatedTodo;
      return updatedTodo;
    }

    return await this.request<Todo>(`/todos/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteTodo(id: string): Promise<void> {
    if (this.useMockData) {
      const todoIndex = MOCK_TODOS.findIndex((todo) => todo.id === id);
      if (todoIndex === -1) {
        throw new Error("Todo not found");
      }
      MOCK_TODOS.splice(todoIndex, 1);
      return;
    }

    return await this.request<void>(`/todos/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiClient = new ApiClient();
export type { CreateTodoRequest, UpdateTodoRequest };
