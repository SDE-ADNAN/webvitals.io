import { 
  connectDatabase, 
  disconnectDatabase, 
  testDatabaseConnection,
  executeWithRetry,
  logDatabaseError,
  prisma,
  connectionPool
} from "./prisma";

// Mock the Prisma client
jest.mock("@prisma/client", () => {
  const mockPrismaClient = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock the pg Pool
jest.mock("pg", () => {
  const mockPool = {
    end: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mockPool),
  };
});

// Mock the Prisma adapter
jest.mock("@prisma/adapter-pg", () => ({
  PrismaPg: jest.fn(),
}));

describe("Database Connection Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("connectDatabase", () => {
    it("should connect successfully on first attempt", async () => {
      (prisma.$connect as jest.Mock).mockResolvedValueOnce(undefined);

      await connectDatabase();

      expect(prisma.$connect).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("✅ Database connected successfully");
    });

    it("should retry up to 3 times with exponential backoff", async () => {
      const error = new Error("Connection failed");
      (prisma.$connect as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);

      await connectDatabase();

      expect(prisma.$connect).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("Database connection attempt 1/3 failed:"),
        "Connection failed"
      );
      expect(console.log).toHaveBeenCalledWith("✅ Database connected successfully");
    });

    it("should throw error after 3 failed attempts", async () => {
      const error = new Error("Connection failed");
      (prisma.$connect as jest.Mock).mockRejectedValue(error);

      await expect(connectDatabase()).rejects.toThrow(
        "Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
      );

      expect(prisma.$connect).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(
        "❌ Failed to connect to database after maximum retries"
      );
    });

    it("should use exponential backoff between retries", async () => {
      jest.useFakeTimers();
      const error = new Error("Connection failed");
      (prisma.$connect as jest.Mock)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(undefined);

      const connectPromise = connectDatabase();

      // First retry after 2 seconds
      await jest.advanceTimersByTimeAsync(2000);
      // Second retry after 4 seconds
      await jest.advanceTimersByTimeAsync(4000);

      await connectPromise;

      expect(prisma.$connect).toHaveBeenCalledTimes(3);
      jest.useRealTimers();
    });
  });

  describe("disconnectDatabase", () => {
    it("should disconnect Prisma client and close connection pool", async () => {
      (prisma.$disconnect as jest.Mock).mockResolvedValueOnce(undefined);
      (connectionPool.end as jest.Mock).mockResolvedValueOnce(undefined);

      await disconnectDatabase();

      expect(prisma.$disconnect).toHaveBeenCalledTimes(1);
      expect(connectionPool.end).toHaveBeenCalledTimes(1);
      expect(console.log).toHaveBeenCalledWith("✅ Prisma client disconnected successfully");
      expect(console.log).toHaveBeenCalledWith("✅ Connection pool closed successfully");
    });

    it("should log error and throw if disconnect fails", async () => {
      const error = new Error("Disconnect failed");
      (prisma.$disconnect as jest.Mock).mockRejectedValueOnce(error);

      await expect(disconnectDatabase()).rejects.toThrow("Disconnect failed");

      expect(console.error).toHaveBeenCalledWith(
        "❌ Error disconnecting from database:",
        "Disconnect failed"
      );
    });

    it("should log error and throw if pool close fails", async () => {
      const error = new Error("Pool close failed");
      (prisma.$disconnect as jest.Mock).mockResolvedValueOnce(undefined);
      (connectionPool.end as jest.Mock).mockRejectedValueOnce(error);

      await expect(disconnectDatabase()).rejects.toThrow("Pool close failed");

      expect(console.error).toHaveBeenCalledWith(
        "❌ Error disconnecting from database:",
        "Pool close failed"
      );
    });
  });

  describe("testDatabaseConnection", () => {
    it("should return true when database is reachable", async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ "?column?": 1 }]);

      const result = await testDatabaseConnection();

      expect(result).toBe(true);
      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it("should return false and log error when database is unreachable", async () => {
      const error = new Error("Database unreachable");
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(error);

      const result = await testDatabaseConnection();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        "Database health check failed:",
        "Database unreachable"
      );
    });
  });

  describe("executeWithRetry", () => {
    it("should execute operation successfully on first attempt", async () => {
      const operation = jest.fn().mockResolvedValueOnce("success");

      const result = await executeWithRetry(operation, "testOperation");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should retry up to 3 times with exponential backoff", async () => {
      const error = new Error("Operation failed");
      const operation = jest.fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce("success");

      const result = await executeWithRetry(operation, "testOperation");

      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation "testOperation" attempt 1/3 failed:'),
        expect.objectContaining({
          error: "Operation failed",
          context: "testOperation",
        })
      );
    });

    it("should throw error after 3 failed attempts", async () => {
      const error = new Error("Operation failed");
      const operation = jest.fn().mockRejectedValue(error);

      await expect(executeWithRetry(operation, "testOperation")).rejects.toThrow(
        "Operation failed"
      );

      expect(operation).toHaveBeenCalledTimes(3);
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation "testOperation" failed after 3 attempts')
      );
    });

    it("should log error context with stack trace", async () => {
      const error = new Error("Operation failed");
      const operation = jest.fn().mockRejectedValueOnce(error);

      try {
        await executeWithRetry(operation, "testOperation");
      } catch (e) {
        // Expected to throw
      }

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Database operation "testOperation" attempt 1/3 failed:'),
        expect.objectContaining({
          error: "Operation failed",
          stack: expect.any(String),
          context: "testOperation",
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe("logDatabaseError", () => {
    it("should log error with context", () => {
      const error = new Error("Database error");
      const context = {
        operation: "createUser",
        userId: "123",
      };

      logDatabaseError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        "❌ Database error:",
        expect.objectContaining({
          error: "Database error",
          stack: expect.any(String),
          operation: "createUser",
          userId: "123",
          timestamp: expect.any(String),
        })
      );
    });

    it("should handle non-Error objects", () => {
      const error = "String error";
      const context = { operation: "testOp" };

      logDatabaseError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        "❌ Database error:",
        expect.objectContaining({
          error: "String error",
          operation: "testOp",
          timestamp: expect.any(String),
        })
      );
    });
  });
});
