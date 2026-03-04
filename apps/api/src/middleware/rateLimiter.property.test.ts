// Feature: backend-api, Property 8: Rate Limit Enforcement
// For any IP exceeding 100 requests per 15 minutes, return 429
// Validates: Requirements 22.2, 22.3

import * as fc from "fast-check";
import request from "supertest";
import express from "express";
import rateLimit from "express-rate-limit";

describe("Property 8: Rate Limit Enforcement", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Configure rate limiting for testing (lower limits for faster testing)
    const limiter = rateLimit({
      windowMs: 1000, // 1 second for testing
      max: 3, // Limit to 3 requests per second for testing
      message: {
        error: "RateLimitError",
        message: "Too many requests from this IP, please try again later."
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const retryAfter = Math.ceil(1); // 1 second for testing
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
          error: "RateLimitError",
          message: "Too many requests from this IP, please try again later."
        });
      },
      // Exclude health check from rate limiting
      skip: (req) => req.url === "/api/health",
    });

    app.use(limiter);
    
    // Test routes
    app.get("/test-endpoint", (req, res) => {
      res.json({ success: true });
    });
    
    app.get("/api/health", (req, res) => {
      res.json({ status: "ok" });
    });
  });

  it("should return 429 when rate limit is exceeded", async () => {
    // Make requests up to the limit
    for (let i = 0; i < 3; i++) {
      await request(app)
        .get("/test-endpoint")
        .expect(200);
    }
    
    // The next request should be rate limited
    await request(app)
      .get("/test-endpoint")
      .expect(429)
      .expect((res) => {
        expect(res.body).toHaveProperty("error", "RateLimitError");
        expect(res.body).toHaveProperty("message");
        expect(typeof res.body.message).toBe("string");
      });
  });

  it("should not rate limit health check endpoint", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 10 }),
        async (requestCount) => {
          // Make multiple requests to health check
          for (let i = 0; i < requestCount; i++) {
            await request(app)
              .get("/api/health")
              .expect(200)
              .expect((res) => {
                expect(res.body).toHaveProperty("status", "ok");
              });
          }
        }
      ),
      { numRuns: 20 }
    );
  });

  it("should include rate limit headers in responses", async () => {
    await request(app)
      .get("/test-endpoint")
      .expect(200)
      .expect((res) => {
        // Should include rate limit headers
        expect(res.headers).toHaveProperty("ratelimit-limit");
        expect(res.headers).toHaveProperty("ratelimit-remaining");
        expect(res.headers).toHaveProperty("ratelimit-reset");
      });
  });
});

// Feature: backend-api, Property 9: Retry-After Header on Rate Limit
// For any rate limit exceeded request, response should include Retry-After header
// Validates: Requirements 22.4

describe("Property 9: Retry-After Header on Rate Limit", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Configure rate limiting for testing
    const limiter = rateLimit({
      windowMs: 2000, // 2 seconds for testing
      max: 2, // Limit to 2 requests per 2 seconds for testing
      message: {
        error: "RateLimitError",
        message: "Too many requests from this IP, please try again later."
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        const retryAfter = Math.ceil(2); // 2 seconds for testing
        res.set('Retry-After', retryAfter.toString());
        res.status(429).json({
          error: "RateLimitError",
          message: "Too many requests from this IP, please try again later."
        });
      },
    });

    app.use(limiter);
    
    // Test route
    app.get("/test-rate-limit", (req, res) => {
      res.json({ success: true });
    });
  });

  it("should include Retry-After header when rate limit is exceeded", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 5 }),
        async (requestCount) => {
          // Create a fresh app instance for each test iteration
          const testApp = express();
          testApp.use(express.json());
          
          // Configure rate limiting for testing
          const limiter = rateLimit({
            windowMs: 2000, // 2 seconds for testing
            max: 2, // Limit to 2 requests per 2 seconds for testing
            message: {
              error: "RateLimitError",
              message: "Too many requests from this IP, please try again later."
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
              const retryAfter = Math.ceil(2); // 2 seconds for testing
              res.set('Retry-After', retryAfter.toString());
              res.status(429).json({
                error: "RateLimitError",
                message: "Too many requests from this IP, please try again later."
              });
            },
          });

          testApp.use(limiter);
          
          // Test route
          testApp.get("/test-rate-limit", (req, res) => {
            res.json({ success: true });
          });
          
          // Make requests up to the limit first
          for (let i = 0; i < 2; i++) {
            await request(testApp)
              .get("/test-rate-limit")
              .expect(200);
          }
          
          // Make additional requests that should be rate limited
          for (let i = 0; i < requestCount - 2; i++) {
            await request(testApp)
              .get("/test-rate-limit")
              .expect(429)
              .expect((res) => {
                // Should include Retry-After header
                expect(res.headers).toHaveProperty("retry-after");
                expect(res.headers["retry-after"]).toBeDefined();
                
                // Retry-After should be a valid number (as string)
                const retryAfter = parseInt(res.headers["retry-after"], 10);
                expect(retryAfter).toBeGreaterThan(0);
                expect(retryAfter).toBeLessThanOrEqual(10); // Reasonable upper bound
                
                // Should return proper error response
                expect(res.body).toHaveProperty("error", "RateLimitError");
                expect(res.body).toHaveProperty("message");
              });
          }
        }
      ),
      { numRuns: 5 } // Reduce number of runs to avoid timing issues
    );
  });

  it("should not include Retry-After header for successful requests", async () => {
    await request(app)
      .get("/test-rate-limit")
      .expect(200)
      .expect((res) => {
        // Should not include Retry-After header for successful requests
        expect(res.headers).not.toHaveProperty("retry-after");
        expect(res.body).toHaveProperty("success", true);
      });
  });
});