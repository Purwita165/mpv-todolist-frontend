import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux"
import filtersReducer from "./slices/filtersSlice"
import uiReducer from "./slices/uiSlice"

export const store = configureStore({
  reducer: {
    filters: filtersReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
