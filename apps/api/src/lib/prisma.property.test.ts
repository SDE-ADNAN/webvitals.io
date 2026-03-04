/**
 * Property-based tests for database connection management
 * Feature: backend-api, Property 11: Database Connection Retry
 * Validates: Requirements 25.3
 */

import * as fc from 'fast-check';
import { executeWithRetry } from './prisma';

describe('Database Connection Management Property Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property 11: Database Connection Retry
   * For any failed database query, retry up to 3 times with exponential backoff
   * **Validates: Requirements 25.3**
   */
  describe('Feature: backend-api, Property 11: Database Connection Retry', () => {
    it('should retry any failed database operation up to 3 times', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1, max: 3 }), // Number of failures before success
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          async (failureCount, context) => {
            let attemptCount = 0;
            const mockOperation = jest.fn(async () => {
              attemptCount++;
              if (attemptCount <= failureCount) {
                throw new Error(`Database operation failed (attempt ${attemptCount})`);
              }
              return 'success';
            });

            // Property: Operation should succeed after specified number of failures
            const result = await executeWithRetry(mockOperation, context);

            expect(result).toBe('success');
            expect(mockOperation).toHaveBeenCalledTimes(failureCount + 1);
            expect(attemptCount).toBe(failureCount + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should throw error after 3 failed attempts for any operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.string({ minLength: 10, maxLength: 50 }), // Error message
          async (context, errorMessage) => {
            const mockOperation = jest.fn(async () => {
              throw new Error(errorMessage);
            });

            // Property: After 3 failures, the original error should be thrown
            await expect(executeWithRetry(mockOperation, context)).rejects.toThrow(
              errorMessage
            );

            // Property: Operation should be attempted exactly 3 times
            expect(mockOperation).toHaveBeenCalledTimes(3);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use exponential backoff between retries', async () => {
      jest.useFakeTimers();

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          async (context) => {
            let attemptCount = 0;
            const attemptTimestamps: number[] = [];

            const mockOperation = jest.fn(async () => {
              attemptCount++;
              attemptTimestamps.push(Date.now());
              
              if (attemptCount < 3) {
                throw new Error('Database operation failed');
              }
              return 'success';
            });

            const operationPromise = executeWithRetry(mockOperation, context);

            // First attempt happens immediately
            await Promise.resolve();
            expect(attemptCount).toBe(1);

            // Second attempt after 2 seconds (2^1 * 1000ms)
            await jest.advanceTimersByTimeAsync(2000);
            await Promise.resolve();
            expect(attemptCount).toBe(2);

            // Third attempt after 4 seconds (2^2 * 1000ms)
            await jest.advanceTimersByTimeAsync(4000);
            await Promise.resolve();

            const result = await operationPromise;

            // Property: Operation should succeed after retries
            expect(result).toBe('success');
            expect(attemptCount).toBe(3);
          }
        ),
        { numRuns: 50 } // Reduced runs due to timer manipulation
      );

      jest.useRealTimers();
    });

    it('should succeed immediately if operation succeeds on first attempt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.constant(null),
            fc.object()
          ), // Any return value
          async (context, returnValue) => {
            const mockOperation = jest.fn(async () => returnValue);

            // Property: Successful operations should not retry
            const result = await executeWithRetry(mockOperation, context);

            expect(result).toBe(returnValue);
            expect(mockOperation).toHaveBeenCalledTimes(1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should log error context for each failed attempt', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.string({ minLength: 10, maxLength: 50 }), // Error message
          async (context, errorMessage) => {
            const mockOperation = jest.fn(async () => {
              throw new Error(errorMessage);
            });

            try {
              await executeWithRetry(mockOperation, context);
            } catch (error) {
              // Expected to throw after 3 attempts
            }

            // Property: Error should be logged for each attempt
            expect(console.error).toHaveBeenCalledTimes(4); // 3 attempts + 1 final failure message
            
            // Verify first attempt log
            expect(console.error).toHaveBeenCalledWith(
              expect.stringContaining(`Database operation "${context}" attempt 1/3 failed:`),
              expect.objectContaining({
                error: errorMessage,
                context,
              })
            );

            // Verify final failure log
            expect(console.error).toHaveBeenCalledWith(
              expect.stringContaining(`Database operation "${context}" failed after 3 attempts`)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve the original error type and message', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.string({ minLength: 10, maxLength: 50 }), // Error message
          async (context, errorMessage) => {
            const originalError = new Error(errorMessage);
            const mockOperation = jest.fn(async () => {
              throw originalError;
            });

            // Property: The thrown error should be the original error
            try {
              await executeWithRetry(mockOperation, context);
              fail('Expected operation to throw error');
            } catch (error) {
              expect(error).toBe(originalError);
              expect((error as Error).message).toBe(errorMessage);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle different error types correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.oneof(
            fc.constant(new Error('Standard Error')),
            fc.constant(new TypeError('Type Error')),
            fc.constant(new RangeError('Range Error')),
            fc.constant('String error'),
            fc.constant({ error: 'Object error' })
          ),
          async (context, error) => {
            const mockOperation = jest.fn(async () => {
              throw error;
            });

            // Property: Any error type should be handled and rethrown
            try {
              await executeWithRetry(mockOperation, context);
              fail('Expected operation to throw error');
            } catch (thrownError) {
              expect(thrownError).toBe(error);
              expect(mockOperation).toHaveBeenCalledTimes(3);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle operations that return promises correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 5, maxLength: 30 }), // Operation context
          fc.integer({ min: 1, max: 2 }), // Number of failures
          async (context, failureCount) => {
            let attemptCount = 0;
            const mockOperation = async () => {
              attemptCount++;
              if (attemptCount <= failureCount) {
                return Promise.reject(new Error('Async operation failed'));
              }
              return Promise.resolve({ data: 'success', attemptCount });
            };

            // Property: Async operations should be retried correctly
            const result = await executeWithRetry(mockOperation, context);

            expect(result).toEqual({ data: 'success', attemptCount: failureCount + 1 });
            expect(attemptCount).toBe(failureCount + 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
