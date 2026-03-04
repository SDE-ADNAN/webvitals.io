// Feature: backend-api, Property 16: Request Logging
// For any HTTP request, system should log method, path, and timestamp
// Validates: Requirements 23.1

import * as fc from "fast-check";
import request from "supertest";
import express from "express";
import morgan from "morgan";
import { errorHandler } from "./errorHandler";

describe("Property 16: Request Logging", () => {
  let app: express.Application;
  let logOutput: string[];

  beforeEach(() => {
    logOutput = [];
    app = express();
    app.use(express.json());
    
    // Configure morgan to capture logs for testing
    app.use(
      morgan("dev", {
        stream: {
          write: (message: string) => {
            logOutput.push(message.trim());
          }
        },
        // Exclude health check endpoint from logs
        skip: (req) => req.url === "/api/health",
      })
    );
    
    // Test routes
    app.get("/test-logging", (req, res) => {
      res.json({ success: true });
    });
    
    app.post("/test-logging", (req, res) => {
      res.json({ success: true });
    });
    
    app.put("/test-logging/:id", (req, res) => {
      res.json({ success: true, id: req.params.id });
    });
    
    app.delete("/test-logging/:id", (req, res) => {
      res.json({ success: true, id: req.params.id });
    });
    
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });
  });

  it("should log HTTP method, path, and status for any request", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("GET", "POST", "PUT", "DELETE"),
        fc.constantFrom("/test-logging", "/test-logging/123"),
        async (method, path) => {
          // Clear previous logs
          logOutput.length = 0;
          
          let requestBuilder = request(app);
          
          switch (method) {
            case "GET":
              requestBuilder = requestBuilder.get(path);
              break;
            case "POST":
              requestBuilder = requestBuilder.post(path);
              break;
            case "PUT":
              requestBuilder = requestBuilder.put(path);
              break;
            case "DELETE":
              requestBuilder = requestBuilder.delete(path);
              break;
          }
          
          await requestBuilder.expect(200);
          
          // Should have logged the request
          expect(logOutput.length).toBeGreaterThan(0);
          
          const logEntry = logOutput[0];
          
          // Should contain HTTP method
          expect(logEntry).toContain(method);
          
          // Should contain path
          expect(logEntry).toContain(path);
          
          // Should contain status code
          expect(logEntry).toContain("200");
          
          // Should be a string (basic format check)
          expect(typeof logEntry).toBe("string");
        }
      ),
      { numRuns: 50 }
    );
  });

  it("should not log health check requests", async () => {
    // Clear previous logs
    logOutput.length = 0;
    
    await request(app)
      .get("/api/health")
      .expect(200);
    
    // Should not have logged the health check request
    expect(logOutput.length).toBe(0);
  });

  it("should log different status codes appropriately", async () => {
    // Add a route that returns 404
    app.get("/test-404", (req, res) => {
      res.status(404).json({ error: "Not found" });
    });
    
    // Clear previous logs
    logOutput.length = 0;
    
    await request(app)
      .get("/test-404")
      .expect(404);
    
    // Should have logged the request with 404 status
    expect(logOutput.length).toBeGreaterThan(0);
    const logEntry = logOutput[0];
    
    expect(logEntry).toContain("GET");
    expect(logEntry).toContain("/test-404");
    expect(logEntry).toContain("404");
  });

  it("should log requests with response time information", async () => {
    // Clear previous logs
    logOutput.length = 0;
    
    await request(app)
      .get("/test-logging")
      .expect(200);
    
    // Should have logged the request
    expect(logOutput.length).toBeGreaterThan(0);
    
    const logEntry = logOutput[0];
    
    // Morgan 'dev' format includes response time (e.g., "- 1.234 ms")
    expect(logEntry).toMatch(/\d+(\.\d+)?\s*ms/);
  });
});

// Feature: backend-api, Property 17: Error Logging with Stack Trace
// For any error, system should log error message and stack trace
// Validates: Requirements 19.3, 23.3

describe("Property 17: Error Logging with Stack Trace", () => {
  let app: express.Application;
  let errorLogs: any[];
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    errorLogs = [];
    
    // Mock console.error to capture error logs
    originalConsoleError = console.error;
    console.error = jest.fn((...args: any[]) => {
      errorLogs.push(args);
    });
    
    app = express();
    app.use(express.json());
    
    // Test routes that throw different types of errors
    app.get("/test-error/:type", (req, res, next) => {
      const errorType = req.params.type;
      
      switch (errorType) {
        case "generic":
          next(new Error("Generic test error"));
          break;
        case "custom":
          const customError = new Error("Custom error with details");
          customError.stack = "Error: Custom error with details\n    at test-file.js:123:45";
          next(customError);
          break;
        case "database":
          const dbError = new Error("Database connection failed");
          dbError.stack = "Error: Database connection failed\n    at db-module.js:67:89";
          next(dbError);
          break;
        default:
          res.json({ success: true });
      }
    });
    
    // Add error handler
    app.use(errorHandler);
  });

  afterEach(() => {
    // Restore original console.error
    console.error = originalConsoleError;
  });

  it("should log error message and stack trace for any error", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom("generic", "custom", "database"),
        async (errorType) => {
          // Clear previous error logs
          errorLogs.length = 0;
          
          await request(app)
            .get(`/test-error/${errorType}`)
            .expect(500);
          
          // Should have logged the error
          expect(errorLogs.length).toBeGreaterThan(0);
          
          // Find the error log entry
          const errorLogEntry = errorLogs.find(log => 
            log.length > 0 && 
            typeof log[0] === 'string' && 
            log[0].includes('Error occurred at')
          );
          
          expect(errorLogEntry).toBeDefined();
          
          // Should contain error details
          const logData = errorLogEntry[1];
          expect(logData).toHaveProperty('error');
          expect(logData).toHaveProperty('stack');
          expect(logData).toHaveProperty('timestamp');
          
          // Error message should be a string
          expect(typeof logData.error).toBe('string');
          expect(logData.error.length).toBeGreaterThan(0);
          
          // Stack trace should be a string
          expect(typeof logData.stack).toBe('string');
          expect(logData.stack.length).toBeGreaterThan(0);
          
          // Stack trace should contain error information
          expect(logData.stack).toContain('Error:');
          
          // Timestamp should be a valid ISO string
          expect(logData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        }
      ),
      { numRuns: 30 }
    );
  });

  it("should include request context in error logs", async () => {
    // Clear previous error logs
    errorLogs.length = 0;
    
    await request(app)
      .get("/test-error/generic")
      .expect(500);
    
    // Should have logged the error with request context
    expect(errorLogs.length).toBeGreaterThan(0);
    
    const errorLogEntry = errorLogs.find(log => 
      log.length > 0 && 
      typeof log[0] === 'string' && 
      log[0].includes('Error occurred at')
    );
    
    expect(errorLogEntry).toBeDefined();
    
    // Should contain request method and path in the log message
    expect(errorLogEntry[0]).toContain('GET');
    expect(errorLogEntry[0]).toContain('/test-error/generic');
  });

  it("should log stack traces with file and line information", async () => {
    // Clear previous error logs
    errorLogs.length = 0;
    
    await request(app)
      .get("/test-error/custom")
      .expect(500);
    
    // Should have logged the error
    expect(errorLogs.length).toBeGreaterThan(0);
    
    const errorLogEntry = errorLogs.find(log => 
      log.length > 0 && 
      typeof log[0] === 'string' && 
      log[0].includes('Error occurred at')
    );
    
    expect(errorLogEntry).toBeDefined();
    
    const logData = errorLogEntry[1];
    
    // Stack trace should contain file and line information
    expect(logData.stack).toContain('test-file.js:123:45');
  });
});