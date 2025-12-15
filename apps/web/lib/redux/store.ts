import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
import themeReducer from "./slices/themeSlice";
import userReducer from "./slices/userSlice";
import uiReducer from "./slices/uiSlice";

// Persist configuration for theme
const themePersistConfig = {
  key: "theme",
  storage,
};

// Persist configuration for user
const userPersistConfig = {
  key: "user",
  storage,
  whitelist: ["token", "user"], // Only persist token and user data
};

// Create persisted reducers
const persistedThemeReducer = persistReducer(themePersistConfig, themeReducer);
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);

export const store = configureStore({
  reducer: {
    theme: persistedThemeReducer,
    user: persistedUserReducer,
    ui: uiReducer, // UI state is not persisted
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
