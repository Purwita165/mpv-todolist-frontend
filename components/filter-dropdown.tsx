// src/components/filter-dropdown.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  setCompleted,
  setPriority,
  setSort,
  setOrder,
  setDateRange,
  resetFilters,
  setSearchQuery,
} from "@/lib/store/slices/filtersSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter } from "lucide-react";

interface FilterDropdownProps {
  theme: "light" | "dark";
}

export function FilterDropdown({ theme }: FilterDropdownProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.filters);

  const [open, setOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.searchQuery || "");
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // debug: log filters whenever they change
  useEffect(() => {
    console.log("[FilterDropdown] filters:", filters);
  }, [filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    dispatch(setSearchQuery(e.target.value));
  };

  const handleCompletedChange = (v: string) => dispatch(setCompleted(v as any));
  const handlePriorityChange = (v: string) => dispatch(setPriority(v as any));
  const handleSortChange = (v: string) => dispatch(setSort(v as any));
  const handleOrderChange = (v: string) => dispatch(setOrder(v as any));
  const handleDateGteChange = (v: string) =>
    dispatch(setDateRange({ gte: v || undefined, lte: filters.dateLte }));
  const handleDateLteChange = (v: string) =>
    dispatch(setDateRange({ gte: filters.dateGte, lte: v || undefined }));

  return (
    <div ref={wrapperRef} className="relative inline-block text-sm">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-md border ${
          theme === "dark"
            ? "bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800"
            : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50"
        }`}
      >
        <Filter className="w-4 h-4" />
        Filters
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Filters"
          className={`absolute right-0 mt-2 w-72 p-4 rounded-lg shadow-lg z-50 ${
            theme === "dark" ? "bg-gray-900 text-white border border-gray-800" : "bg-white text-gray-900 border border-gray-200"
          }`}
          style={{ minWidth: 280 }}
        >
          {/* Search */}
          <div className="mb-3">
            <label htmlFor="filter-search" className="block text-xs font-medium mb-1">
              Search
            </label>
            <Input
              id="filter-search"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="h-9"
            />
          </div>

          {/* Completed */}
          <div className="mb-3">
            <label htmlFor="filter-completed" className="block text-xs font-medium mb-1">
              By Completed
            </label>
            <select
              id="filter-completed"
              value={filters.completed}
              onChange={(e) => handleCompletedChange(e.target.value)}
              className="w-full h-9 rounded px-2 border"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Priority */}
          <div className="mb-3">
            <label htmlFor="filter-priority" className="block text-xs font-medium mb-1">
              By Priority
            </label>
            <select
              id="filter-priority"
              value={filters.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              className="w-full h-9 rounded px-2 border"
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="mb-3">
            <label className="block text-xs font-medium mb-1">By Date Range</label>
            <div className="flex gap-2">
              <Input
                id="filter-date-gte"
                type="date"
                value={filters.dateGte || ""}
                onChange={(e) => handleDateGteChange(e.target.value)}
                className="h-9"
              />
              <Input
                id="filter-date-lte"
                type="date"
                value={filters.dateLte || ""}
                onChange={(e) => handleDateLteChange(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="mb-3">
            <label htmlFor="filter-sort" className="block text-xs font-medium mb-1">
              Sort
            </label>
            <div className="flex gap-2">
              <select
                id="filter-sort"
                value={filters.sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-1/2 h-9 rounded px-2 border"
              >
                <option value="date">Date</option>
                <option value="priority">Priority</option>
              </select>
              <select
                id="filter-order"
                value={filters.order}
                onChange={(e) => handleOrderChange(e.target.value)}
                className="w-1/2 h-9 rounded px-2 border"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => {
                dispatch(resetFilters());
                setSearchInput("");
              }}
              className="flex-1 h-9"
            >
              Reset
            </Button>
            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              className="h-9"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
