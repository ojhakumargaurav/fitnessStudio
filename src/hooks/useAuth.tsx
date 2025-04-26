
'use client';

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { login as serverLogin } from '@/actions/auth'; // Import the server action

// Define the user type more explicitly, including status
interface AuthenticatedUser {
  id: string;
  role: string;
  status?: string; // Add status, optional for trainers/admins
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean; // Add loading state
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start loading until check is complete

  useEffect(() => {
    // Check local storage for stored user data on initial load.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
        // Basic validation of the stored object
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        } else {
           console.warn('Invalid user data found in local storage.');
           localStorage.removeItem('user'); // Clear invalid data
        }
      } catch (error) {
        console.error('Error parsing user data from local storage:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
    setIsLoading(false); // Finished loading/checking local storage
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await serverLogin(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user)); // Store user data.
        setIsLoading(false);
        return true;
      } else {
        // Handle login failure (e.g., display error message)
        console.error('Login failed:', result.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear stored user data on logout.
  };

  // Provide isLoading state to consumers
  const contextValue = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) { // Check for undefined specifically
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
