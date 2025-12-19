import axios, { AxiosError } from "axios";
import { store } from "../redux/store";
import { logout } from "../redux/slices/userSlice";

/**
 * Axios API client configured with:
 * - Base URL from environment variables
 * - 10-second timeout
 * - Request interceptor for auth token
 * - Response interceptor for 401 handling and network errors
 */
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  timeout: 10000, // 10 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 * Automatically includes authentication token in Authorization header
 */
apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.user.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles 401 errors (unauthorized) and network errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Pass through successful responses
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized - clear auth state and redirect to login
    if (error.response?.status === 401) {
      store.dispatch(logout());
      // Only redirect if we're in a browser environment
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    // Handle timeout errors
    if (error.code === "ECONNABORTED") {
      return Promise.reject(
        new Error("Request timeout - please try again")
      );
    }

    // Handle network errors (no response received)
    if (!error.response) {
      return Promise.reject(
        new Error("Network error - please check your connection")
      );
    }

    // Pass through other errors
    return Promise.reject(error);
  }
);
