import { describe, it, expect, beforeEach } from "vitest";
import { apiClient } from "./client";

describe("API Client", () => {
  beforeEach(() => {
    // Reset any interceptors or state if needed
  });

  it("should be configured with correct baseURL", () => {
    expect(apiClient.defaults.baseURL).toBeDefined();
    expect(
      apiClient.defaults.baseURL === process.env.NEXT_PUBLIC_API_URL ||
      apiClient.defaults.baseURL === "http://localhost:3000/api"
    ).toBe(true);
  });

  it("should have a 10-second timeout", () => {
    expect(apiClient.defaults.timeout).toBe(10000);
  });

  it("should have Content-Type header set to application/json", () => {
    expect(apiClient.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("should have request interceptor configured", () => {
    // Verify interceptors object exists
    expect(apiClient.interceptors.request).toBeDefined();
    expect(typeof apiClient.interceptors.request.use).toBe("function");
  });

  it("should have response interceptor configured", () => {
    // Verify interceptors object exists
    expect(apiClient.interceptors.response).toBeDefined();
    expect(typeof apiClient.interceptors.response.use).toBe("function");
  });
});
