/**
 * UUID mock for Jest tests
 * Provides deterministic UUIDs for testing
 */

let counter = 0;

export const v4 = (): string => {
  counter++;
  return `00000000-0000-0000-0000-${counter.toString().padStart(12, '0')}`;
};

export const resetCounter = (): void => {
  counter = 0;
};

// Reset counter before each test
beforeEach(() => {
  resetCounter();
});
