import fc from "fast-check";
import { validateEnv } from "./env";

// Feature: backend-api, Property 14: Environment Variable Validation
// For any server startup, if required variables missing, fail with clear error
// **Validates: Requirements 27.4, 27.5**

describe("Property-Based Tests: Environment Variable Validation", () => {
  // Store original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Property 14: Environment Variable Validation", () => {
    it("should fail with clear error message when any required variable is missing", () => {
      fc.assert(
        fc.property(
          fc.record({
            NODE_ENV: fc.constantFrom("development", "production", "test"),
            PORT: fc.integer({ min: 1, max: 65535 }).map(String),
            DATABASE_URL: fc.constant(
              "postgresql://user:pass@localhost:5432/db"
            ),
            JWT_SECRET: fc.string({ minLength: 32, maxLength: 64 }),
            JWT_EXPIRES_IN: fc.constantFrom("7d", "24h", "60m", "3600s"),
            FRONTEND_URL: fc.constant("http://localhost:3000"),
          }),
          fc.constantFrom(
            "NODE_ENV",
            "PORT",
            "DATABASE_URL",
            "JWT_SECRET",
            "JWT_EXPIRES_IN",
            "FRONTEND_URL"
          ),
          (validEnv, missingVar) => {
            // Create environment with one required variable missing
            const incompleteEnv = { ...validEnv };
            delete incompleteEnv[missingVar as keyof typeof incompleteEnv];

            process.env = incompleteEnv as any;

            // Should throw error
            expect(() => validateEnv()).toThrow();

            // Error message should mention missing variables
            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("Missing required");
              expect(errorMessage).toContain(missingVar);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should validate successfully when all required variables are present and valid", () => {
      fc.assert(
        fc.property(
          fc.record({
            NODE_ENV: fc.constantFrom("development", "production", "test"),
            PORT: fc.integer({ min: 1, max: 65535 }).map(String),
            DATABASE_URL: fc
              .tuple(
                fc.stringMatching(/^[a-z0-9]+$/),
                fc.stringMatching(/^[a-z0-9]+$/),
                fc.stringMatching(/^[a-z0-9]+$/),
                fc.integer({ min: 1, max: 65535 }),
                fc.stringMatching(/^[a-z0-9]+$/)
              )
              .map(
                ([user, pass, host, port, db]) =>
                  `postgresql://${user}:${pass}@${host}:${port}/${db}`
              ),
            JWT_SECRET: fc.string({ minLength: 32, maxLength: 64 }),
            JWT_EXPIRES_IN: fc.constantFrom("7d", "24h", "60m", "3600s"),
            FRONTEND_URL: fc
              .tuple(
                fc.constantFrom("http", "https"),
                fc.stringMatching(/^[a-z0-9]+$/),
                fc.integer({ min: 1, max: 65535 })
              )
              .map(([protocol, host, port]) => `${protocol}://${host}:${port}`),
            LOG_LEVEL: fc.constantFrom("debug", "info", "warn", "error"),
            LOG_FILE_PATH: fc.constant("./logs/app.log"),
          }),
          (validEnv) => {
            process.env = validEnv as any;

            // Should not throw
            expect(() => validateEnv()).not.toThrow();

            // Should return valid config
            const config = validateEnv();
            expect(config.NODE_ENV).toBe(validEnv.NODE_ENV);
            expect(config.PORT).toBe(parseInt(validEnv.PORT, 10));
            expect(config.DATABASE_URL).toBe(validEnv.DATABASE_URL);
            expect(config.JWT_SECRET).toBe(validEnv.JWT_SECRET);
            expect(config.JWT_EXPIRES_IN).toBe(validEnv.JWT_EXPIRES_IN);
            expect(config.FRONTEND_URL).toBe(validEnv.FRONTEND_URL);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should fail with clear error for invalid NODE_ENV values", () => {
      fc.assert(
        fc.property(
          fc
            .string()
            .filter(
              (s) => !["development", "production", "test"].includes(s) && s !== ""
            ),
          (invalidNodeEnv) => {
            process.env = {
              NODE_ENV: invalidNodeEnv,
              PORT: "4000",
              DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
              JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
              JWT_EXPIRES_IN: "7d",
              FRONTEND_URL: "http://localhost:3000",
            };

            expect(() => validateEnv()).toThrow();

            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("Invalid NODE_ENV");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should fail with clear error for invalid PORT values", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ max: 0 }),
            fc.integer({ min: 65536 }),
            fc.string().filter((s) => isNaN(parseInt(s, 10)))
          ),
          (invalidPort) => {
            process.env = {
              NODE_ENV: "development",
              PORT: String(invalidPort),
              DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
              JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
              JWT_EXPIRES_IN: "7d",
              FRONTEND_URL: "http://localhost:3000",
            };

            expect(() => validateEnv()).toThrow();

            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("Invalid PORT");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should fail with clear error for invalid DATABASE_URL format", () => {
      fc.assert(
        fc.property(
          fc
            .string()
            .filter((s) => !s.startsWith("postgresql://") && s !== ""),
          (invalidDbUrl) => {
            process.env = {
              NODE_ENV: "development",
              PORT: "4000",
              DATABASE_URL: invalidDbUrl,
              JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
              JWT_EXPIRES_IN: "7d",
              FRONTEND_URL: "http://localhost:3000",
            };

            expect(() => validateEnv()).toThrow();

            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("Invalid DATABASE_URL");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should fail with clear error for invalid JWT_EXPIRES_IN format", () => {
      fc.assert(
        fc.property(
          fc
            .string()
            .filter((s) => !/^\d+[smhd]$/.test(s) && s !== ""),
          (invalidExpires) => {
            process.env = {
              NODE_ENV: "development",
              PORT: "4000",
              DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
              JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
              JWT_EXPIRES_IN: invalidExpires,
              FRONTEND_URL: "http://localhost:3000",
            };

            expect(() => validateEnv()).toThrow();

            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("Invalid JWT_EXPIRES_IN");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should enforce JWT_SECRET minimum length in production", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 31 }),
          (shortSecret) => {
            process.env = {
              NODE_ENV: "production",
              PORT: "4000",
              DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
              JWT_SECRET: shortSecret,
              JWT_EXPIRES_IN: "7d",
              FRONTEND_URL: "http://localhost:3000",
            };

            expect(() => validateEnv()).toThrow();

            try {
              validateEnv();
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;
              expect(errorMessage).toContain("JWT_SECRET");
              expect(errorMessage).toContain("32");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should provide helpful error messages that guide users to fix configuration", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            "NODE_ENV",
            "PORT",
            "DATABASE_URL",
            "JWT_SECRET",
            "JWT_EXPIRES_IN",
            "FRONTEND_URL"
          ),
          (missingVar) => {
            // Create minimal environment with one variable missing
            const minimalEnv: any = {
              NODE_ENV: "development",
              PORT: "4000",
              DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
              JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
              JWT_EXPIRES_IN: "7d",
              FRONTEND_URL: "http://localhost:3000",
            };

            delete minimalEnv[missingVar];
            process.env = minimalEnv;

            try {
              validateEnv();
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const errorMessage = (error as Error).message;

              // Error message should be helpful
              expect(errorMessage).toContain("validation failed");
              expect(errorMessage).toContain(".env");
              expect(errorMessage).toContain(missingVar);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
