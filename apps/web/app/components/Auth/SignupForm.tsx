'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { signupSchema, type SignupFormData } from '@/lib/validations/schemas';
import { Input } from '@/app/components/UI/Input';
import { Button } from '@/app/components/UI/Button';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser, setToken } from '@/lib/redux/slices/userSlice';

export function SignupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Mock signup - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful signup
      const mockToken = `mock_token_${Date.now()}`;
      const mockUser = {
        id: 1,
        email: data.email,
        firstName: undefined,
        lastName: undefined,
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
    } catch (error) {
      setSubmitError('Signup failed. Please try again.');
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
        placeholder="Create a password"
        error={errors.password?.message}
        autoComplete="new-password"
        helperText="Must be at least 8 characters with uppercase, lowercase, and number"
      />

      <Input
        {...register('confirmPassword')}
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
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
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
