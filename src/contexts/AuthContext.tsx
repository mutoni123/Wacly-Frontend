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

interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    current_password?: string;
    new_password?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    updateProfile: (data: ProfileUpdateData) => Promise<void>;
}

interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        first_name?: string;
        firstName?: string;
        last_name?: string;
        lastName?: string;
        email: string;
        role: string;
        department: {
            id: string;
            name: string;
        } | string;
    };
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
    refreshUser: async () => {},
    updateProfile: async () => {},
});

const api = axios.create({
    baseURL: 'http://localhost:5000/api/auth',
    headers: {
        'Content-Type': 'application/json',
    },
});

const transformUserData = (userData: LoginResponse['user']): User => {
    if (!userData) {
        throw new Error('No user data provided');
    }

    console.log('Received user data:', userData);

    // Check if department is an object or string
    let departmentName = 'None';
    if (typeof userData.department === 'object' && userData.department) {
        departmentName = userData.department.name || 'None';
    } else if (typeof userData.department === 'string') {
        departmentName = userData.department;
    }

    const transformedUser = {
        id: userData.id,
        firstName: userData.firstName || userData.first_name || '',
        lastName: userData.lastName || userData.last_name || '',
        email: userData.email || '',
        role: userData.role || 'user',
        department: departmentName,
    };

    if (!transformedUser.id || !transformedUser.email) {
        throw new Error('Missing required user data fields');
    }

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
          
          // Set token and auth headers
          localStorage.setItem('token', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          
          // Update state
          setUser(transformedUser);
          setIsAuthenticated(true);
          
          console.log('Login successful - User role:', transformedUser.role);
          
          // Handle routing
          try {
            switch (transformedUser.role.toLowerCase()) {
              case 'admin':
                await router.push('/admin/dashboard');
                break;
              case 'manager':
                await router.push('/manager/dashboard');
                break;
              case 'employee':
                await router.push('/employee/dashboard');
                break;
              default:
                console.error('Invalid role:', transformedUser.role);
                throw new Error('Invalid user role');
            }
          } catch (routingError) {
            console.error('Routing error:', routingError);
            // Don't throw here, just log the error
          }
        } catch (error) {
          console.error('Login error:', error);
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
            const response = await api.get('/me');
    
            // Log the raw response to debug
            console.log('Raw /me response:', response.data);
    
            // Transform the data structure from your getMe endpoint
            const transformedUser = transformUserData({
                id: response.data.data.id,
                first_name: response.data.data.first_name,
                last_name: response.data.data.last_name,
                email: response.data.data.email,
                role: response.data.data.role,
                department: response.data.data.department // This should be an object or string
            });
    
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

    const updateProfile = async (data: ProfileUpdateData): Promise<void> => {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token');

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            const response = await api.put('/profile', {
                first_name: data.firstName,
                last_name: data.lastName,
                current_password: data.current_password,
                new_password: data.new_password
            });

            // Handle the data structure from your updateProfile endpoint
            const transformedUser = transformUserData({
                id: response.data.data.id,
                first_name: response.data.data.first_name,
                last_name: response.data.data.last_name,
                email: response.data.data.email,
                role: response.data.data.role,
                department: response.data.data.department
            });
            
            setUser(transformedUser);
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                logout,
                refreshUser,
                updateProfile
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