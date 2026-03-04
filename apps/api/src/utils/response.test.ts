import { Response } from "express";
import {
  formatTimestamp,
  formatTimestampsInObject,
  sendSuccess,
  sendCreated,
  sendPaginatedSuccess,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError,
  calculatePagination,
  parsePaginationParams,
} from "./response";

describe("Response Utilities", () => {
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe("formatTimestamp", () => {
    it("should format Date object to ISO 8601 string", () => {
      const date = new Date("2024-01-15T10:30:00.000Z");
      const result = formatTimestamp(date);
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should format date string to ISO 8601 string", () => {
      const dateString = "2024-01-15T10:30:00.000Z";
      const result = formatTimestamp(dateString);
      expect(result).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should handle various date formats", () => {
      const date = new Date("2024-01-15");
      const result = formatTimestamp(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("formatTimestampsInObject", () => {
    it("should format Date objects in simple object", () => {
      const obj = {
        name: "Test",
        createdAt: new Date("2024-01-15T10:30:00.000Z"),
      };
      const result = formatTimestampsInObject(obj);
      expect(result.createdAt).toBe("2024-01-15T10:30:00.000Z");
      expect(result.name).toBe("Test");
    });

    it("should format Date objects in nested objects", () => {
      const obj = {
        user: {
          name: "Test",
          createdAt: new Date("2024-01-15T10:30:00.000Z"),
        },
      };
      const result = formatTimestampsInObject(obj);
      expect(result.user.createdAt).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should format Date objects in arrays", () => {
      const obj = [
        { createdAt: new Date("2024-01-15T10:30:00.000Z") },
        { createdAt: new Date("2024-01-16T10:30:00.000Z") },
      ];
      const result = formatTimestampsInObject(obj);
      expect(result[0].createdAt).toBe("2024-01-15T10:30:00.000Z");
      expect(result[1].createdAt).toBe("2024-01-16T10:30:00.000Z");
    });

    it("should handle null and undefined", () => {
      expect(formatTimestampsInObject(null)).toBeNull();
      expect(formatTimestampsInObject(undefined)).toBeUndefined();
    });

    it("should handle primitive values", () => {
      expect(formatTimestampsInObject("test")).toBe("test");
      expect(formatTimestampsInObject(123)).toBe(123);
      expect(formatTimestampsInObject(true)).toBe(true);
    });
  });

  describe("sendSuccess", () => {
    it("should send 200 status code", () => {
      sendSuccess(mockRes as Response, { id: 1 });
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should wrap data in consistent structure", () => {
      const data = { id: 1, name: "Test" };
      sendSuccess(mockRes as Response, data);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: 1, name: "Test" },
          timestamp: expect.any(String),
        })
      );
    });

    it("should include optional message", () => {
      sendSuccess(mockRes as Response, { id: 1 }, "Success message");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Success message",
        })
      );
    });

    it("should format timestamps in data", () => {
      const data = {
        id: 1,
        createdAt: new Date("2024-01-15T10:30:00.000Z"),
      };
      sendSuccess(mockRes as Response, data);
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.data.createdAt).toBe("2024-01-15T10:30:00.000Z");
    });

    it("should include ISO 8601 timestamp", () => {
      sendSuccess(mockRes as Response, { id: 1 });
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("sendCreated", () => {
    it("should send 201 status code", () => {
      sendCreated(mockRes as Response, { id: 1 });
      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it("should wrap data in consistent structure", () => {
      const data = { id: 1, name: "Test" };
      sendCreated(mockRes as Response, data);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: 1, name: "Test" },
          timestamp: expect.any(String),
        })
      );
    });

    it("should include optional message", () => {
      sendCreated(mockRes as Response, { id: 1 }, "Created successfully");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Created successfully",
        })
      );
    });
  });

  describe("sendPaginatedSuccess", () => {
    it("should send 200 status code", () => {
      sendPaginatedSuccess(
        mockRes as Response,
        [{ id: 1 }],
        { page: 1, limit: 10, total: 1 }
      );
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it("should include pagination metadata", () => {
      sendPaginatedSuccess(
        mockRes as Response,
        [{ id: 1 }, { id: 2 }],
        { page: 1, limit: 10, total: 25 }
      );
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [{ id: 1 }, { id: 2 }],
          pagination: {
            page: 1,
            limit: 10,
            total: 25,
            totalPages: 3,
          },
          timestamp: expect.any(String),
        })
      );
    });

    it("should calculate totalPages if not provided", () => {
      sendPaginatedSuccess(
        mockRes as Response,
        [],
        { page: 1, limit: 10, total: 25 }
      );
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.pagination.totalPages).toBe(3);
    });

    it("should use provided totalPages", () => {
      sendPaginatedSuccess(
        mockRes as Response,
        [],
        { page: 1, limit: 10, total: 25, totalPages: 5 }
      );
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.pagination.totalPages).toBe(5);
    });

    it("should format timestamps in array items", () => {
      const data = [
        { id: 1, createdAt: new Date("2024-01-15T10:30:00.000Z") },
      ];
      sendPaginatedSuccess(
        mockRes as Response,
        data,
        { page: 1, limit: 10, total: 1 }
      );
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.data[0].createdAt).toBe("2024-01-15T10:30:00.000Z");
    });
  });

  describe("sendError", () => {
    it("should send error with specified status code", () => {
      sendError(mockRes as Response, 400, "Bad Request", "Invalid input");
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should include error type and message", () => {
      sendError(mockRes as Response, 400, "Bad Request", "Invalid input");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Bad Request",
          message: "Invalid input",
          timestamp: expect.any(String),
        })
      );
    });

    it("should include optional details", () => {
      sendError(
        mockRes as Response,
        400,
        "Validation Error",
        "Invalid fields",
        { fields: ["email", "password"] }
      );
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          details: { fields: ["email", "password"] },
        })
      );
    });

    it("should include ISO 8601 timestamp", () => {
      sendError(mockRes as Response, 500, "Error", "Something went wrong");
      
      const call = jsonMock.mock.calls[0][0];
      expect(call.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });

  describe("sendBadRequest", () => {
    it("should send 400 status code", () => {
      sendBadRequest(mockRes as Response, "Invalid input");
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it("should include Bad Request error type", () => {
      sendBadRequest(mockRes as Response, "Invalid input");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Bad Request",
          message: "Invalid input",
        })
      );
    });
  });

  describe("sendUnauthorized", () => {
    it("should send 401 status code", () => {
      sendUnauthorized(mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it("should use default message", () => {
      sendUnauthorized(mockRes as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Unauthorized",
          message: "Authentication required",
        })
      );
    });

    it("should use custom message", () => {
      sendUnauthorized(mockRes as Response, "Invalid token");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid token",
        })
      );
    });
  });

  describe("sendForbidden", () => {
    it("should send 403 status code", () => {
      sendForbidden(mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(403);
    });

    it("should use default message", () => {
      sendForbidden(mockRes as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Forbidden",
          message: "You do not have permission to access this resource",
        })
      );
    });
  });

  describe("sendNotFound", () => {
    it("should send 404 status code", () => {
      sendNotFound(mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(404);
    });

    it("should use default message", () => {
      sendNotFound(mockRes as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Not Found",
          message: "Resource not found",
        })
      );
    });
  });

  describe("sendConflict", () => {
    it("should send 409 status code", () => {
      sendConflict(mockRes as Response, "Email already exists");
      expect(statusMock).toHaveBeenCalledWith(409);
    });

    it("should include conflict message", () => {
      sendConflict(mockRes as Response, "Email already exists");
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Conflict",
          message: "Email already exists",
        })
      );
    });
  });

  describe("sendInternalError", () => {
    it("should send 500 status code", () => {
      sendInternalError(mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(500);
    });

    it("should use default message", () => {
      sendInternalError(mockRes as Response);
      
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Internal Server Error",
          message: "An unexpected error occurred",
        })
      );
    });
  });

  describe("calculatePagination", () => {
    it("should calculate pagination metadata", () => {
      const result = calculatePagination(1, 10, 25);
      expect(result).toEqual({
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });

    it("should handle exact page boundaries", () => {
      const result = calculatePagination(1, 10, 20);
      expect(result.totalPages).toBe(2);
    });

    it("should handle single page", () => {
      const result = calculatePagination(1, 10, 5);
      expect(result.totalPages).toBe(1);
    });

    it("should handle zero items", () => {
      const result = calculatePagination(1, 10, 0);
      expect(result.totalPages).toBe(0);
    });

    it("should enforce minimum page of 1", () => {
      const result = calculatePagination(0, 10, 25);
      expect(result.page).toBe(1);
    });

    it("should enforce minimum limit of 1", () => {
      const result = calculatePagination(1, 0, 25);
      expect(result.limit).toBe(1);
    });

    it("should enforce maximum limit of 100", () => {
      const result = calculatePagination(1, 200, 1000);
      expect(result.limit).toBe(100);
    });

    it("should use default values", () => {
      const result = calculatePagination(undefined, undefined, 25);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe("parsePaginationParams", () => {
    it("should parse valid page and limit", () => {
      const result = parsePaginationParams({ page: "2", limit: "20" });
      expect(result).toEqual({ page: 2, limit: 20 });
    });

    it("should use defaults for missing params", () => {
      const result = parsePaginationParams({});
      expect(result).toEqual({ page: 1, limit: 10 });
    });

    it("should handle invalid page number", () => {
      const result = parsePaginationParams({ page: "invalid" });
      expect(result.page).toBe(1);
    });

    it("should handle invalid limit number", () => {
      const result = parsePaginationParams({ limit: "invalid" });
      expect(result.limit).toBe(10);
    });

    it("should enforce minimum page of 1", () => {
      const result = parsePaginationParams({ page: "-5" });
      expect(result.page).toBe(1);
    });

    it("should enforce minimum limit of 1", () => {
      const result = parsePaginationParams({ limit: "-5" });
      expect(result.limit).toBe(1);
    });

    it("should enforce maximum limit of 100", () => {
      const result = parsePaginationParams({ limit: "500" });
      expect(result.limit).toBe(100);
    });
  });
});
