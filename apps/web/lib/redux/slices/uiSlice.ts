import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  activeModal: string | null;
}

const initialState: UIState = {
  sidebarOpen: true,
  mobileMenuOpen: false,
  activeModal: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { toggleSidebar, toggleMobileMenu, openModal, closeModal } =
  uiSlice.actions;

// Selectors
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectActiveModal = (state: RootState) => state.ui.activeModal;

export default uiSlice.reducer;
