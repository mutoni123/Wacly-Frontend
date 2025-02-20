// contexts/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    first_name?: string;  // Added fallback for snake_case
    firstName?: string,   // Added fallback for camelCase
    last_name?: string,   // Added fallback for snake_case
    lastName?: string,    // Added fallback for camelCase
    email: string;
    role: string;
    department: string;
  };
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

const api = axios.create({
  baseURL: 'http://localhost:5000/api/auth',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Transform response data to match our User interface
const transformUserData = (userData: any): User => {
  if (!userData) {
    throw new Error('No user data provided');
  }

  // Log the received data for debugging
  console.log('Received user data:', userData);

  const transformedUser = {
    id: userData.id,
    firstName: userData.firstName || userData.first_name || '',
    lastName: userData.lastName || userData.last_name || '',
    email: userData.email || '',
    role: userData.role || 'user',
    department: userData.department || 'None',
  };

  // Validate transformed data
  if (!transformedUser.id || !transformedUser.email) {
    throw new Error('Missing required user data fields');
  }

  // Log the transformed data
  console.log('Transformed user data:', transformedUser);

  return transformedUser;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('Attempting login...');

      const response = await api.post<LoginResponse>('/login', {
        email,
        password,
      });

      console.log('Raw login response:', response.data);

      const { accessToken, user: rawUserData } = response.data;

      // Transform and validate user data
      const transformedUser = transformUserData(rawUserData);

      // Store token
      localStorage.setItem('token', accessToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Update state
      setUser(transformedUser);
      setIsAuthenticated(true);

      console.log('Login successful - Transformed user:', transformedUser);

      // Navigate based on role
      const userRole = transformedUser.role.toLowerCase();
      switch (userRole) {
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'manager':
          router.push('/manager/dashboard');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const response = await api.get('/profile');

      const transformedUser = transformUserData(response.data);
      setUser(transformedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');

      if (window.location.pathname !== '/login') {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/logout', null, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setIsAuthenticated(false);
      router.push('/login');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated,
            isLoading,
            login,
            logout,
            refreshUser
          }}
      >
        {children}
      </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}