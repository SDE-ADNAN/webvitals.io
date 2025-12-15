import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../store";
import type { User } from "@webvitals/types";

interface UserState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setUser, setToken, logout, setLoading } = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.user.isAuthenticated;

export default userSlice.reducer;
