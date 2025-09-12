import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { UIState } from "../../types"

const initialState: UIState = {
  viewMode: "scroll",
  theme: "dark",
  showAddModal: false,
  showNotification: false,
  notificationMessage: "",
}

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setViewMode: (state, action: PayloadAction<"page" | "scroll">) => {
      state.viewMode = action.payload
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload
    },
    setShowAddModal: (state, action: PayloadAction<boolean>) => {
      state.showAddModal = action.payload
    },
    showNotification: (state, action: PayloadAction<string>) => {
      state.showNotification = true
      state.notificationMessage = action.payload
    },
    hideNotification: (state) => {
      state.showNotification = false
      state.notificationMessage = ""
    },
  },
})

export const { setViewMode, setTheme, setShowAddModal, showNotification, hideNotification } = uiSlice.actions

export default uiSlice.reducer
