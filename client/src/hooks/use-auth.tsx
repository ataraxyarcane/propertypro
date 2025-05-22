import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { AuthUser, User } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const { isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!localStorage.getItem('token'),
    onSuccess: (data) => {
      setUser(data);
    },
    onError: () => {
      // Clear token if authentication fails
      localStorage.removeItem('token');
      setUser(null);
    }
  });

  useEffect(() => {
    // Setup axios interceptor for auth header
    const token = localStorage.getItem('token');
    if (token) {
      // Set auth header for all API requests
      const authInterceptor = (request: Request): Request => {
        const newRequest = new Request(request);
        newRequest.headers.set('Authorization', `Bearer ${token}`);
        return newRequest;
      };
      
      // This is a simplified approach since we can't directly modify fetch
      // In a real app, you might use axios which has proper interceptors
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        // Only add auth header for API requests
        if (typeof args[0] === 'string' && args[0].startsWith('/api')) {
          const request = args[0] instanceof Request ? args[0] : new Request(args[0], args[1]);
          const authorizedRequest = authInterceptor(request);
          return originalFetch(authorizedRequest);
        }
        return originalFetch(...args);
      };
      
      return () => {
        // Restore original fetch when component unmounts
        window.fetch = originalFetch;
      };
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', { username, password });
      const data: { user: User; token: string } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data in state
      setUser(data.user);
      
      // Invalidate queries to refetch with new auth
      queryClient.invalidateQueries();
      
      // Redirect to dashboard
      setLocation('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);
      const data: { user: User; token: string } = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Set user data in state
      setUser(data.user);
      
      // Invalidate queries to refetch with new auth
      queryClient.invalidateQueries();
      
      // Redirect to dashboard
      setLocation('/');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Clear user data
    setUser(null);
    
    // Clear query cache
    queryClient.clear();
    
    // Redirect to login
    setLocation('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
