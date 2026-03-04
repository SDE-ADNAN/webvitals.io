# React Query Integration Examples

This document provides example React Query hooks for integrating the frontend with the backend API.

## Prerequisites

```bash
npm install @tanstack/react-query axios
```

## API Client Setup

First, ensure your API client is configured in `apps/web/lib/api/client.ts`:

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
```

## Authentication Hooks

### useLogin Hook

```typescript
// apps/web/lib/react-query/mutations/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import { useAppDispatch } from '@/lib/redux/hooks';
import { setUser, setToken } from '@/lib/redux/slices/userSlice';
