import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { prisma } from "../lib/prisma";

/**
 * User registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

/**
 * User login data
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * User response (without password)
 */
export interface UserResponse {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Authentication response with token and user
 */
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

/**
 * Remove password from user object
 */
function sanitizeUser(user: any): UserResponse {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Register a new user
 * @throws Error if email already exists or validation fails
 */
export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  // Validate email format
  if (!isValidEmail(data.email)) {
    throw new Error("Invalid email format");
  }

  // Validate password length (min 8 characters)
  if (data.password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    (error as any).statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await hashPassword(data.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    },
  });

  // Generate JWT token
  const token = signToken({
    userId: user.id.toString(),
    email: user.email,
  });

  // Return token and user (without password)
  return {
    token,
    user: sanitizeUser(user),
  };
}

/**
 * Login a user
 * @throws Error if credentials are invalid
 */
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  // Validate email and password are provided
  if (!data.email || !data.password) {
    throw new Error("Email and password are required");
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    const error = new Error("Invalid credentials");
    (error as any).statusCode = 401;
    throw error;
  }

  // Compare password hash
  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    const error = new Error("Invalid credentials");
    (error as any).statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id.toString(),
    email: user.email,
  });

  // Return token and user (without password)
  return {
    token,
    user: sanitizeUser(user),
  };
}

/**
 * Get user by ID
 * @throws Error if user not found
 */
export async function getUserById(userId: string): Promise<UserResponse> {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId, 10) },
  });

  if (!user) {
    const error = new Error("User not found");
    (error as any).statusCode = 404;
    throw error;
  }

  return sanitizeUser(user);
}
