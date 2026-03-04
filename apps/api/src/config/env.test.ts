import { validateEnv, isDevelopment, isProduction, isTest } from "./env";

describe("Environment Configuration", () => {
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

  describe("validateEnv", () => {
    it("should validate a complete valid configuration", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
        LOG_LEVEL: "info",
        LOG_FILE_PATH: "./logs/app.log",
      };

      const config = validateEnv();

      expect(config.NODE_ENV).toBe("development");
      expect(config.PORT).toBe(4000);
      expect(config.DATABASE_URL).toBe(
        "postgresql://user:pass@localhost:5432/db"
      );
      expect(config.JWT_SECRET).toBe(
        "a-very-secure-secret-key-with-at-least-32-characters"
      );
      expect(config.JWT_EXPIRES_IN).toBe("7d");
      expect(config.FRONTEND_URL).toBe("http://localhost:3000");
      expect(config.LOG_LEVEL).toBe("info");
      expect(config.LOG_FILE_PATH).toBe("./logs/app.log");
    });

    it("should throw error when required variables are missing", () => {
      process.env = {
        NODE_ENV: "development",
        // Missing PORT, DATABASE_URL, JWT_SECRET, JWT_EXPIRES_IN, FRONTEND_URL
      };

      expect(() => validateEnv()).toThrow(
        /Missing required environment variables/
      );
      expect(() => validateEnv()).toThrow(/PORT/);
      expect(() => validateEnv()).toThrow(/DATABASE_URL/);
      expect(() => validateEnv()).toThrow(/JWT_SECRET/);
    });

    it("should throw error for invalid NODE_ENV", () => {
      process.env = {
        NODE_ENV: "invalid",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/Invalid NODE_ENV value/);
      expect(() => validateEnv()).toThrow(
        /Must be one of: development, production, test/
      );
    });

    it("should throw error for invalid PORT", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "invalid",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/Invalid PORT value/);
    });

    it("should throw error for PORT out of range", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "70000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/Invalid PORT value/);
      expect(() => validateEnv()).toThrow(/between 1 and 65535/);
    });

    it("should throw error for invalid DATABASE_URL format", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "mysql://user:pass@localhost:3306/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/Invalid DATABASE_URL format/);
      expect(() => validateEnv()).toThrow(/Must start with "postgresql:\/\/"/);
    });

    it("should throw error for default JWT_SECRET in production", () => {
      process.env = {
        NODE_ENV: "production",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "your-secret-key-here",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/JWT_SECRET is using the default/);
      expect(() => validateEnv()).toThrow(/insecure for production/);
    });

    it("should warn but not throw for default JWT_SECRET in development", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "your-secret-key-here",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("WARNING: Using default JWT_SECRET")
      );

      consoleWarnSpy.mockRestore();
    });

    it("should throw error for short JWT_SECRET in production", () => {
      process.env = {
        NODE_ENV: "production",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "short",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/JWT_SECRET must be at least 32/);
    });

    it("should warn but not throw for short JWT_SECRET in development", () => {
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "short",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).not.toThrow();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("JWT_SECRET should be at least 32")
      );

      consoleWarnSpy.mockRestore();
    });

    it("should throw error for invalid JWT_EXPIRES_IN format", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "invalid",
        FRONTEND_URL: "http://localhost:3000",
      };

      expect(() => validateEnv()).toThrow(/Invalid JWT_EXPIRES_IN format/);
    });

    it("should accept valid JWT_EXPIRES_IN formats", () => {
      const validFormats = ["7d", "24h", "60m", "3600s"];

      validFormats.forEach((format) => {
        process.env = {
          NODE_ENV: "development",
          PORT: "4000",
          DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
          JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
          JWT_EXPIRES_IN: format,
          FRONTEND_URL: "http://localhost:3000",
        };

        expect(() => validateEnv()).not.toThrow();
      });
    });

    it("should throw error for invalid FRONTEND_URL", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "not-a-valid-url",
      };

      expect(() => validateEnv()).toThrow(/Invalid FRONTEND_URL format/);
    });

    it("should throw error for invalid LOG_LEVEL", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
        LOG_LEVEL: "invalid",
      };

      expect(() => validateEnv()).toThrow(/Invalid LOG_LEVEL value/);
      expect(() => validateEnv()).toThrow(
        /Must be one of: debug, info, warn, error/
      );
    });

    it("should use default values for optional variables", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
        // LOG_LEVEL and LOG_FILE_PATH not provided
      };

      const config = validateEnv();

      expect(config.LOG_LEVEL).toBe("info");
      expect(config.LOG_FILE_PATH).toBe("./logs/app.log");
    });

    it("should use DATABASE_URL as fallback for TEST_DATABASE_URL", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
        // TEST_DATABASE_URL not provided
      };

      const config = validateEnv();

      expect(config.TEST_DATABASE_URL).toBe(config.DATABASE_URL);
    });

    it("should use TEST_DATABASE_URL when provided", () => {
      process.env = {
        NODE_ENV: "development",
        PORT: "4000",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        TEST_DATABASE_URL: "postgresql://user:pass@localhost:5432/test_db",
        JWT_SECRET: "a-very-secure-secret-key-with-at-least-32-characters",
        JWT_EXPIRES_IN: "7d",
        FRONTEND_URL: "http://localhost:3000",
      };

      const config = validateEnv();

      expect(config.TEST_DATABASE_URL).toBe(
        "postgresql://user:pass@localhost:5432/test_db"
      );
    });

    it("should provide clear error message with multiple validation failures", () => {
      process.env = {
        NODE_ENV: "invalid",
        PORT: "invalid",
        DATABASE_URL: "mysql://invalid",
        JWT_SECRET: "short",
        JWT_EXPIRES_IN: "invalid",
        FRONTEND_URL: "not-a-url",
      };

      expect(() => validateEnv()).toThrow(
        /Environment configuration validation failed/
      );
    });
  });

  describe("Environment helper functions", () => {
    it("isDevelopment should return true when NODE_ENV is development", () => {
      process.env.NODE_ENV = "development";
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);
    });

    it("isProduction should return true when NODE_ENV is production", () => {
      process.env.NODE_ENV = "production";
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isTest()).toBe(false);
    });

    it("isTest should return true when NODE_ENV is test", () => {
      process.env.NODE_ENV = "test";
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });
});
