/**
 * Integration tests for authentication endpoints
 * Tests the full HTTP request/response cycle for auth endpoints
 * 
 * Requirements: 3.1-5.5
 */

import request from "supertest";
import express from "express";
import cors from "cors";
import { signToken } from "../utils/jwt";
import authRoutes from "./authRoutes";
import { authenticate } from "../middleware/auth";
import { testPrisma } from "../test-utils/database";
import { createTestUser } from "../test-utils/factories";
import { hashPassword } from "../utils/password";

describe("Auth Endpoints - Integration Tests", () => {
  let app: express.Application;

  beforeEach(() => {
    // Create Express app with same configuration as main app
    app = express();

    // Configure CORS
    app.use(
      cors({
        origin: "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Site-ID"],
      })
    );

    // Body parser
    app.use(express.json());

    // Mount auth routes
    app.use("/api/auth", authRoutes);
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user with valid data", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      // Verify response structure
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");

      // Verify user object
      expect(response.body.user).toMatchObject({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
      });

      // Verify password is not included in response
      expect(response.body.user).not.toHaveProperty("password");

      // Verify token is a string
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);

      // Verify user was created in database
      const dbUser = await testPrisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(dbUser).toBeTruthy();
      expect(dbUser?.email).toBe(userData.email);
    });

    it("should register a user without optional fields", async () => {
      const userData = {
        email: "minimal@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBeNull();
      expect(response.body.user.lastName).toBeNull();
    });

    it("should return 409 when registering with duplicate email", async () => {
      // Create a user first
      const existingUser = await createTestUser({
        email: "existing@example.com",
        password: "password123",
      });

      // Try to register with same email
      const userData = {
        email: existingUser.email,
        password: "differentpassword",
        firstName: "Another",
        lastName: "User",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(409);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Conflict");
      expect(response.body.message).toContain("already registered");
    });

    it("should return 400 for invalid email format", async () => {
      const userData = {
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("email");
    });

    it("should return 400 for password shorter than 8 characters", async () => {
      const userData = {
        email: "test@example.com",
        password: "short",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("8 characters");
    });

    it("should hash password before storing", async () => {
      const userData = {
        email: "hashtest@example.com",
        password: "password123",
      };

      await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      // Verify password is hashed in database
      const dbUser = await testPrisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(dbUser).toBeTruthy();
      expect(dbUser?.password).not.toBe(userData.password);
      expect(dbUser?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with valid credentials", async () => {
      // Create a test user
      const password = "password123";
      const user = await createTestUser({
        email: "login@example.com",
        password,
      });

      const loginData = {
        email: user.email,
        password,
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("user");

      // Verify user object
      expect(response.body.user).toMatchObject({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Verify password is not included in response
      expect(response.body.user).not.toHaveProperty("password");

      // Verify token is a string
      expect(typeof response.body.token).toBe("string");
      expect(response.body.token.length).toBeGreaterThan(0);
    });

    it("should return 401 for invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should return 401 for invalid password", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "wrongpass@example.com",
        password: "correctpassword",
      });

      const loginData = {
        email: user.email,
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Invalid credentials");
    });

    it("should return 400 when email is missing", async () => {
      const loginData = {
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 when password is missing", async () => {
      const loginData = {
        email: "test@example.com",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return current user with valid token", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "currentuser@example.com",
        password: "password123",
      });

      // Generate a valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty("user");

      // Verify user object
      expect(response.body.user).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      });

      // Verify password is not included in response
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 when Authorization header is missing", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Authentication required");
    });

    it("should return 401 when token is invalid", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 401 when Authorization format is incorrect", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "InvalidFormat token")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
      expect(response.body.message).toContain("Invalid authorization format");
    });

    it("should return 401 when token is empty", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer ")
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 401 for expired token", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "expiredtoken@example.com",
        password: "password123",
      });

      // Generate an expired token (expires immediately)
      const expiredToken = signToken(
        {
          userId: user.id.toString(),
          email: user.email,
        },
        "0s" // Expires immediately
      );

      // Wait a moment to ensure token is expired
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Unauthorized");
    });

    it("should return 404 when user no longer exists", async () => {
      // Create a test user
      const user = await createTestUser({
        email: "deleteduser@example.com",
        password: "password123",
      });

      // Generate a valid token
      const token = signToken({
        userId: user.id.toString(),
        email: user.email,
      });

      // Delete the user from database
      await testPrisma.user.delete({
        where: { id: user.id },
      });

      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
      expect(response.body).toHaveProperty("message");
      expect(response.body.error).toBe("Not Found");
      expect(response.body.message).toContain("User not found");
    });
  });

  describe("Integration: Full authentication flow", () => {
    it("should complete register -> login -> get current user flow", async () => {
      const userData = {
        email: "fullflow@example.com",
        password: "password123",
        firstName: "Full",
        lastName: "Flow",
      };

      // Step 1: Register
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty("token");
      const registerToken = registerResponse.body.token;

      // Step 2: Login
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty("token");
      const loginToken = loginResponse.body.token;

      // Step 3: Get current user with register token
      const meResponse1 = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${registerToken}`)
        .expect(200);

      expect(meResponse1.body.user.email).toBe(userData.email);

      // Step 4: Get current user with login token
      const meResponse2 = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${loginToken}`)
        .expect(200);

      expect(meResponse2.body.user.email).toBe(userData.email);

      // Both tokens should return the same user
      expect(meResponse1.body.user.id).toBe(meResponse2.body.user.id);
    });
  });

  describe("Security: Password handling", () => {
    it("should never return password in any response", async () => {
      const userData = {
        email: "security@example.com",
        password: "password123",
        firstName: "Security",
        lastName: "Test",
      };

      // Register
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201);

      expect(registerResponse.body.user).not.toHaveProperty("password");

      // Login
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(loginResponse.body.user).not.toHaveProperty("password");

      // Get current user
      const meResponse = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${registerResponse.body.token}`)
        .expect(200);

      expect(meResponse.body.user).not.toHaveProperty("password");
    });
  });

  describe("Response format consistency", () => {
    it("should return consistent error format for all auth endpoints", async () => {
      // Register with invalid data
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({ email: "invalid", password: "short" })
        .expect(400);

      expect(registerResponse.body).toHaveProperty("error");
      expect(registerResponse.body).toHaveProperty("message");

      // Login with invalid credentials
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "nonexistent@example.com", password: "password123" })
        .expect(401);

      expect(loginResponse.body).toHaveProperty("error");
      expect(loginResponse.body).toHaveProperty("message");

      // Get current user without token
      const meResponse = await request(app)
        .get("/api/auth/me")
        .expect(401);

      expect(meResponse.body).toHaveProperty("error");
      expect(meResponse.body).toHaveProperty("message");
    });

    it("should return JSON content type for all responses", async () => {
      // Register
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          email: "jsontest@example.com",
          password: "password123",
        });

      expect(registerResponse.headers["content-type"]).toMatch(
        /application\/json/
      );

      // Login error
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@example.com", password: "wrong" });

      expect(loginResponse.headers["content-type"]).toMatch(
        /application\/json/
      );

      // Get current user error
      const meResponse = await request(app).get("/api/auth/me");

      expect(meResponse.headers["content-type"]).toMatch(/application\/json/);
    });
  });
});
