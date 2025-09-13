"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, Search, Loader2, Trash2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { FilterDropdown } from "@/components/filter-dropdown";
import { EmptyState } from "@/components/empty-states";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useAppSelector, useAppDispatch } from "@/lib/store";
import {
  hideNotification,
  setShowAddModal,
} from "@/lib/store/slices/uiSlice";
import {
  setSearchQuery,
  resetFilters,
} from "@/lib/store/slices/filtersSlice";
import {
  useTodosInfinite,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
} from "@/lib/hooks/useTodos";
import dayjs from "dayjs";
import type { Todo } from "@/lib/types";

export default function TaskManager() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.ui.theme);
  const showNotification = useAppSelector((state) => state.ui.showNotification);
  const notificationMessage = useAppSelector(
    (state) => state.ui.notificationMessage
  );
  const filters = useAppSelector((state) => state.filters);
  const showAddModal = useAppSelector((state) => state.ui.showAddModal);

  const [usingMockData, setUsingMockData] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery);

  // state untuk Add Task form
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newDate, setNewDate] = useState("");

  const sentinelRef = useRef<HTMLDivElement>(null);

  // hooks
  const createTodoMutation = useCreateTodo();
  const updateTodoMutation = useUpdateTodo();
  const deleteTodoMutation = useDeleteTodo();

  // debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setSearchQuery(searchInput));
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput, dispatch]);

  const queryParams = useMemo(
    () => ({
      completed: filters.completed === "all" ? undefined : filters.completed,
      priority: filters.priority === "all" ? undefined : filters.priority,
      dateGte: filters.dateGte,
      dateLte: filters.dateLte,
      sort: filters.sort,
      order: filters.order,
      limit: 10,
    }),
    [filters]
  );

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useTodosInfinite(queryParams);

  useEffect(() => {
    refetch();
  }, [queryParams, refetch]);

  useEffect(() => {
    if (
      error?.message?.includes("Backend not available") ||
      error?.message?.includes("BACKEND_UNAVAILABLE")
    ) {
      setUsingMockData(true);
    } else {
      setUsingMockData(false);
    }
  }, [error]);

  const todos = data?.pages.flatMap((page) => page.todos) ?? [];

  // filtering
  const filteredTodos = useMemo(() => {
    let result = todos;

    if (filters.searchQuery) {
      result = result.filter((todo) =>
        todo.title.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    if (filters.completed !== "all") {
      result = result.filter((todo) =>
        filters.completed === "active" ? !todo.completed : todo.completed
      );
    }

    if (filters.priority !== "all") {
      result = result.filter((todo) => todo.priority === filters.priority);
    }

    if (filters.dateGte) {
      result = result.filter(
        (todo) => new Date(todo.date) >= new Date(filters.dateGte as string)
      );
    }
    if (filters.dateLte) {
      result = result.filter(
        (todo) => new Date(todo.date) <= new Date(filters.dateLte as string)
      );
    }

    if (filters.sort === "date") {
      result = result.sort((a, b) =>
        filters.order === "asc"
          ? new Date(a.date).getTime() - new Date(b.date).getTime()
          : new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (filters.sort === "priority") {
      const order = { low: 1, medium: 2, high: 3 };
      result = result.sort((a, b) =>
        filters.order === "asc"
          ? order[a.priority ?? "low"] - order[b.priority ?? "low"]
          : order[b.priority ?? "low"] - order[a.priority ?? "low"]
      );
    }

    return result;
  }, [todos, filters]);

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "low":
        return "bg-green-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "high":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatPriority = (priority: string) =>
    priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();

  const formatDate = (date: string) => dayjs(date).format("MMM D, YYYY");

  const containerClasses =
    theme === "dark"
      ? "min-h-screen bg-black text-white"
      : "min-h-screen bg-gray-50 text-gray-900";
  const cardClasses =
    theme === "dark"
      ? "bg-gray-900 border-gray-800"
      : "bg-white border-gray-200";
  const inputClasses =
    theme === "dark"
      ? "bg-gray-900 border-gray-800 text-white"
      : "bg-white border-gray-300 text-gray-900";

  // handle create new todo
  const handleCreateTodo = () => {
    if (!newTitle.trim()) return;
    createTodoMutation.mutate({
      title: newTitle,
      completed: false,
      priority: newPriority as "low" | "medium" | "high",
      date: newDate || new Date().toISOString(),
    });
    setNewTitle("");
    setNewPriority("medium");
    setNewDate("");
    dispatch(setShowAddModal(false));
  };

  return (
    <div className={containerClasses}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              What's on Your Plan Today?
            </h1>
            <p
              className={`text-sm sm:text-base ${
                theme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Your productivity starts now.
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Search & Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                theme === "dark" ? "text-gray-400" : "text-gray-500"
              }`}
            />
            <Input
              placeholder="Search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`${inputClasses} pl-10 h-11 w-full`}
            />
          </div>
          <FilterDropdown theme={theme} />
        </div>

        {/* Task List */}
        <div className="space-y-3 mb-20">
          {isLoading ? (
            <LoadingSkeleton theme={theme} />
          ) : filteredTodos.length === 0 ? (
            <EmptyState
              type="no-tasks"
              theme={theme}
              searchQuery={filters.searchQuery}
              onAddTask={() => dispatch(setShowAddModal(true))}
              onClearFilters={() => dispatch(resetFilters())}
              onRetry={() => refetch()}
            />
          ) : (
            filteredTodos.map((todo: Todo) => (
              <Card
                key={todo.id}
                className={`${cardClasses} p-4 hover:shadow-md`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() =>
                      updateTodoMutation.mutateAsync({
                        id: todo.id,
                        data: { completed: !todo.completed },
                      })
                    }
                    className={`border rounded-sm ${
                      theme === "dark"
                        ? "border-gray-400 bg-gray-800 data-[state=checked]:bg-blue-600"
                        : "border-gray-400 bg-white data-[state=checked]:bg-blue-600"
                    }`}
                  />
                  <div className="flex-1">
                    <h3
                      className={`font-medium mb-3 break-words ${
                        todo.completed ? "line-through opacity-60" : ""
                      } ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                    >
                      {todo.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm ${
                          theme === "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        {todo.date ? formatDate(todo.date) : "No date"}
                      </span>
                      {todo.priority && (
                        <Badge
                          className={`text-xs px-2.5 py-1 ${getPriorityColor(
                            todo.priority
                          )}`}
                        >
                          {formatPriority(todo.priority)}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        deleteTodoMutation.mutateAsync(todo.id)
                      }
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Infinite scroll sentinel */}
        <div ref={sentinelRef} className="h-10" />
        {isFetchingNextPage && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}
      </div>

      {/* Add Task button (bottom center) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <Button
          onClick={() => dispatch(setShowAddModal(true))}
          className={`h-12 px-6 rounded-full shadow-lg transform transition-transform duration-200 hover:scale-105 ${
            theme === "dark"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          + Add Task
        </Button>
      </div>

      {/* Add Task Modal */}
      <Dialog
        open={showAddModal}
        onOpenChange={() => dispatch(setShowAddModal(false))}
      >
        <DialogContent
          className={`transition-all duration-300 ease-out transform 
            data-[state=open]:opacity-100 data-[state=open]:scale-100 
            data-[state=closed]:opacity-0 data-[state=closed]:scale-95
            ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"}`}
        >
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Task Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={inputClasses}
            />
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className={`${inputClasses} w-full h-10 rounded-md`}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            <Input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={inputClasses}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => dispatch(setShowAddModal(false))}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTodo}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
