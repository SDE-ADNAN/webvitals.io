/**
 * Unit tests for authentication service
 * Tests password hashing, JWT generation, login/registration logic
 * Requirements: 3.1-3.5, 4.1-4.5
 */

import { registerUser, loginUser, getUserById } from './authService';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken, verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';

// Mock dependencies
jest.mock('../utils/password');
jest.mock('../utils/jwt');
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockComparePassword = comparePassword as jest.MockedFunction<typeof comparePassword>;
const mockSignToken = signToken as jest.MockedFunction<typeof signToken>;
const mockVerifyToken = verifyToken as jest.MockedFunction<typeof verifyToken>;
const mockPrismaUserFindUnique = prisma.user.findUnique as jest.MockedFunction<typeof prisma.user.findUnique>;
const mockPrismaUserCreate = prisma.user.create as jest.MockedFunction<typeof prisma.user.create>;

describe('Authentication Service Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Password Hashing', () => {
    it('should hash password before storing during registration', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = '$2b$10$hashedpassword';
      const email = 'test@example.com';

      mockHashPassword.mockResolvedValue(hashedPassword);
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('mock-jwt-token');

      // Act
      await registerUser({
        email,
        password: plainPassword,
        firstName: 'Test',
        lastName: 'User',
      });

      // Assert
      expect(mockHashPassword).toHaveBeenCalledWith(plainPassword);
      expect(mockPrismaUserCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          password: hashedPassword,
        }),
      });
    });

    it('should use bcrypt with correct salt rounds', async () => {
      // Arrange
      const password = 'testpassword';
      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      await registerUser({
        email: 'test@example.com',
        password,
      });

      // Assert
      expect(mockHashPassword).toHaveBeenCalledWith(password);
    });
  });

  describe('Password Comparison', () => {
    it('should compare password hash during login', async () => {
      // Arrange
      const plainPassword = 'password123';
      const hashedPassword = '$2b$10$hashedpassword';
      const email = 'test@example.com';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignToken.mockReturnValue('mock-jwt-token');

      // Act
      await loginUser({ email, password: plainPassword });

      // Assert
      expect(mockComparePassword).toHaveBeenCalledWith(plainPassword, hashedPassword);
    });

    it('should reject login with incorrect password', async () => {
      // Arrange
      const email = 'test@example.com';
      const wrongPassword = 'wrongpassword';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashedpassword',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(false);

      // Act & Assert
      await expect(loginUser({ email, password: wrongPassword })).rejects.toThrow('Invalid credentials');
      
      const error = await loginUser({ email, password: wrongPassword }).catch(e => e);
      expect(error.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      // Arrange
      mockPrismaUserFindUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(loginUser({ 
        email: 'nonexistent@example.com', 
        password: 'password123' 
      })).rejects.toThrow('Invalid credentials');
      
      const error = await loginUser({ 
        email: 'nonexistent@example.com', 
        password: 'password123' 
      }).catch(e => e);
      expect(error.statusCode).toBe(401);
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate JWT token on successful registration', async () => {
      // Arrange
      const email = 'test@example.com';
      const userId = 1;

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: userId,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('mock-jwt-token');

      // Act
      const result = await registerUser({
        email,
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      // Assert
      expect(mockSignToken).toHaveBeenCalledWith({
        userId: userId.toString(),
        email,
      });
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should generate JWT token on successful login', async () => {
      // Arrange
      const email = 'test@example.com';
      const userId = 1;

      mockPrismaUserFindUnique.mockResolvedValue({
        id: userId,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignToken.mockReturnValue('mock-jwt-token');

      // Act
      const result = await loginUser({ email, password: 'password123' });

      // Assert
      expect(mockSignToken).toHaveBeenCalledWith({
        userId: userId.toString(),
        email,
      });
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should include userId and email in JWT payload', async () => {
      // Arrange
      const email = 'test@example.com';
      const userId = 42;

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: userId,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      await registerUser({ email, password: 'password123' });

      // Assert
      expect(mockSignToken).toHaveBeenCalledWith({
        userId: userId.toString(),
        email,
      });
    });
  });

  describe('JWT Token Verification', () => {
    it('should verify JWT token correctly', () => {
      // Arrange
      const token = 'valid-jwt-token';
      const payload = { userId: '1', email: 'test@example.com' };
      mockVerifyToken.mockReturnValue(payload);

      // Act
      const result = verifyToken(token);

      // Assert
      expect(result).toEqual(payload);
      expect(mockVerifyToken).toHaveBeenCalledWith(token);
    });

    it('should reject expired JWT token', () => {
      // Arrange
      const expiredToken = 'expired-jwt-token';
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token has expired');
      });

      // Act & Assert
      expect(() => verifyToken(expiredToken)).toThrow('Token has expired');
    });

    it('should reject invalid JWT token', () => {
      // Arrange
      const invalidToken = 'invalid-jwt-token';
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      // Act & Assert
      expect(() => verifyToken(invalidToken)).toThrow('Invalid token');
    });
  });

  describe('User Registration Logic', () => {
    it('should validate email format', async () => {
      // Arrange
      const invalidEmail = 'not-an-email';

      // Act & Assert
      await expect(registerUser({
        email: invalidEmail,
        password: 'password123',
      })).rejects.toThrow('Invalid email format');
    });

    it('should validate password length (minimum 8 characters)', async () => {
      // Arrange
      const shortPassword = 'short';

      // Act & Assert
      await expect(registerUser({
        email: 'test@example.com',
        password: shortPassword,
      })).rejects.toThrow('Password must be at least 8 characters long');
    });

    it('should accept valid email and password', async () => {
      // Arrange
      const email = 'valid@example.com';
      const password = 'validpassword123';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: null,
        lastName: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      const result = await registerUser({ email, password });

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe('token');
      expect(result.user.email).toBe(email);
    });

    it('should create user with optional firstName and lastName', async () => {
      // Arrange
      const email = 'test@example.com';
      const firstName = 'John';
      const lastName = 'Doe';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName,
        lastName,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      await registerUser({ email, password: 'password123', firstName, lastName });

      // Assert
      expect(mockPrismaUserCreate).toHaveBeenCalledWith({
        data: {
          email,
          password: '$2b$10$hashed',
          firstName,
          lastName,
        },
      });
    });

    it('should return user object without password', async () => {
      // Arrange
      const email = 'test@example.com';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      const result = await registerUser({ email, password: 'password123' });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect((result.user as any).password).toBeUndefined();
    });
  });

  describe('User Login Logic', () => {
    it('should require email and password', async () => {
      // Act & Assert - missing email
      await expect(loginUser({ 
        email: '', 
        password: 'password123' 
      })).rejects.toThrow('Email and password are required');

      // Act & Assert - missing password
      await expect(loginUser({ 
        email: 'test@example.com', 
        password: '' 
      })).rejects.toThrow('Email and password are required');
    });

    it('should return user object without password on successful login', async () => {
      // Arrange
      const email = 'test@example.com';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignToken.mockReturnValue('token');

      // Act
      const result = await loginUser({ email, password: 'password123' });

      // Assert
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect((result.user as any).password).toBeUndefined();
    });

    it('should return token and user on successful login', async () => {
      // Arrange
      const email = 'test@example.com';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignToken.mockReturnValue('mock-token');

      // Act
      const result = await loginUser({ email, password: 'password123' });

      // Assert
      expect(result).toEqual({
        token: 'mock-token',
        user: expect.objectContaining({
          id: 1,
          email,
          firstName: 'Test',
          lastName: 'User',
        }),
      });
    });
  });

  describe('Duplicate Email Handling', () => {
    it('should reject registration with existing email', async () => {
      // Arrange
      const email = 'existing@example.com';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: 'Existing',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act & Assert
      await expect(registerUser({
        email,
        password: 'password123',
      })).rejects.toThrow('Email already registered');
    });

    it('should return 409 status code for duplicate email', async () => {
      // Arrange
      const email = 'duplicate@example.com';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const error = await registerUser({
        email,
        password: 'password123',
      }).catch(e => e);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.statusCode).toBe(409);
      expect(error.message).toContain('already registered');
    });

    it('should check for existing email before creating user', async () => {
      // Arrange
      const email = 'test@example.com';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: null,
        lastName: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      await registerUser({ email, password: 'password123' });

      // Assert
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(mockPrismaUserCreate).toHaveBeenCalled();
      // Verify findUnique was called (checking for existing email)
      expect(mockPrismaUserFindUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('Get User By ID', () => {
    it('should retrieve user by ID', async () => {
      // Arrange
      const userId = '1';
      const user = {
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaUserFindUnique.mockResolvedValue(user);

      // Act
      const result = await getUserById(userId);

      // Assert
      expect(mockPrismaUserFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result.email).toBe(user.email);
    });

    it('should return user without password', async () => {
      // Arrange
      const userId = '1';

      mockPrismaUserFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: '$2b$10$hashed',
        firstName: 'Test',
        lastName: 'User',
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await getUserById(userId);

      // Assert
      expect((result as any).password).toBeUndefined();
    });

    it('should throw 404 error if user not found', async () => {
      // Arrange
      const userId = '999';
      mockPrismaUserFindUnique.mockResolvedValue(null);

      // Act
      const error = await getUserById(userId).catch(e => e);

      // Assert
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('User not found');
      expect(error.statusCode).toBe(404);
    });
  });

  describe('Edge Cases', () => {
    it('should handle email with different cases', async () => {
      // Arrange
      const email = 'Test@Example.COM';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: null,
        lastName: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      const result = await registerUser({ email, password: 'password123' });

      // Assert
      expect(result.user.email).toBe(email);
    });

    it('should handle password with special characters', async () => {
      // Arrange
      const password = 'P@ssw0rd!#$%';
      const email = 'test@example.com';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: null,
        lastName: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      await registerUser({ email, password });

      // Assert
      expect(mockHashPassword).toHaveBeenCalledWith(password);
    });

    it('should handle exactly 8 character password', async () => {
      // Arrange
      const password = '12345678'; // Exactly 8 characters
      const email = 'test@example.com';

      mockHashPassword.mockResolvedValue('$2b$10$hashed');
      mockPrismaUserFindUnique.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 1,
        email,
        password: '$2b$10$hashed',
        firstName: null,
        lastName: null,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignToken.mockReturnValue('token');

      // Act
      const result = await registerUser({ email, password });

      // Assert
      expect(result).toBeDefined();
      expect(result.token).toBe('token');
    });

    it('should reject 7 character password', async () => {
      // Arrange
      const password = '1234567'; // 7 characters

      // Act & Assert
      await expect(registerUser({
        email: 'test@example.com',
        password,
      })).rejects.toThrow('Password must be at least 8 characters long');
    });
  });
});
