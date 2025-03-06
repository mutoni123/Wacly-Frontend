// types/auth.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  // Add any additional fields needed for profile
  createdAt?: string;
  updatedAt?: string;
}

// Add a new interface for profile updates
export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  current_password?: string;
  new_password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // Add new method for profile updates
  updateProfile: (data: ProfileUpdateData) => Promise<void>;
}