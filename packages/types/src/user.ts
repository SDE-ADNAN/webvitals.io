export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
