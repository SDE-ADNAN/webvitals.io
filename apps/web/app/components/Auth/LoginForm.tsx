'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { loginSchema, type LoginFormData } from '@/lib/validations/schemas';
import { Input } from '@/app/components/UI/Input';
import { Button } from '@/app/components/UI/Button';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser, setToken } from '@/lib/redux/slices/userSlice';

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mock authentication - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful authentication
      const mockToken = `mock_token_${Date.now()}`;
      const mockUser = {
        id: 1,
        email: data.email,
        firstName: 'John',
        lastName: 'Doe',
        avatar: undefined,
        createdAt: new Date().toISOString(),
      };

      // Store token in localStorage
      localStorage.setItem('auth_token', mockToken);

      // Update Redux state
      dispatch(setToken(mockToken));
      dispatch(setUser(mockUser));

      // Redirect to dashboard
      router.push('/dashboard');
    } catch {
      setSubmitError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="you@example.com"
        error={errors.email?.message}
        autoComplete="email"
      />

      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        autoComplete="current-password"
      />

      {submitError && (
        <div
          role="alert"
          className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md"
        >
          {submitError}
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
