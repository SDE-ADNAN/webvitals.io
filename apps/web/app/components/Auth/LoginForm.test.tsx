import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '@/lib/redux/slices/userSlice';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
  });
};

describe('LoginForm', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders email and password fields', () => {
    const store = createMockStore();
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('displays validation errors for missing email', async () => {
    const store = createMockStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Only fill password, leave email empty
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // The validation should show an error for required email
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays validation error for short password', async () => {
    const store = createMockStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const store = createMockStore();
    const user = userEvent.setup();
    
    render(
      <Provider store={store}>
        <LoginForm />
      </Provider>
    );

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
    });
  });
});
