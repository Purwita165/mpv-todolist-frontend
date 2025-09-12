import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CompletedFilter = "all" | "active" | "completed";
export type PriorityFilter = "all" | "low" | "medium" | "high";
export type SortField = "date" | "priority";
export type SortOrder = "asc" | "desc";

export interface FiltersState {
  completed: CompletedFilter;
  priority: PriorityFilter;
  dateGte?: string;
  dateLte?: string;
  sort: SortField;
  order: SortOrder;
  searchQuery: string;
}

const initialState: FiltersState = {
  completed: "all",
  priority: "all",
  dateGte: undefined,
  dateLte: undefined,
  sort: "date",
  order: "desc",
  searchQuery: "",
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setCompleted: (state, action: PayloadAction<CompletedFilter>) => {
      state.completed = action.payload;
    },
    setPriority: (state, action: PayloadAction<PriorityFilter>) => {
      state.priority = action.payload;
    },
    setDateRange: (
      state,
      action: PayloadAction<{ gte?: string; lte?: string }>
    ) => {
      state.dateGte = action.payload.gte;
      state.dateLte = action.payload.lte;
    },
    setSort: (state, action: PayloadAction<SortField>) => {
      state.sort = action.payload;
    },
    setOrder: (state, action: PayloadAction<SortOrder>) => {
      state.order = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetFilters: () => initialState,
  },
});

export const {
  setCompleted,
  setPriority,
  setDateRange,
  setSort,
  setOrder,
  setSearchQuery,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
