
'use client';

import { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import { login as serverLogin } from '@/actions/auth';
import { AdminRoles, type AdminRoleString } from '@/types/roles'; // Import AdminRoles

interface AuthenticatedUser {
  id: string;
  role: string; // Keep as string, can be 'user', 'trainer', 'admin', 'it_admin'
  status?: string;
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Set to true to disable login and default to a specific role for testing
const IS_LOGIN_DISABLED_FOR_TESTING = false; 

// Default user for testing when login is "disabled"
const defaultTestUser: AuthenticatedUser = { // Changed from defaultTestAdminUser for flexibility
  id: 'test-it-admin-001',
  role: AdminRoles.IT_ADMIN, // Test as IT_ADMIN
  status: 'active',
};


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true); 

  useEffect(() => {
    if (IS_LOGIN_DISABLED_FOR_TESTING) {
      setUser(defaultTestUser); // Use the more generic defaultTestUser
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthenticatedUser;
        if (parsedUser && parsedUser.id && parsedUser.role) {
          setUser(parsedUser);
        } else {
           console.warn('Invalid user data found in local storage.');
           localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('Error parsing user data from local storage:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (IS_LOGIN_DISABLED_FOR_TESTING) {
      setUser(defaultTestUser); 
      setIsLoading(false);
      return true; 
    }

    setIsLoading(true);
    try {
      const result = await serverLogin(username, password);
      if (result.success && result.user) {
        setUser(result.user as AuthenticatedUser); // Ensure type consistency
        localStorage.setItem('user', JSON.stringify(result.user));
        setIsLoading(false);
        return true;
      } else {
        console.error('Login failed:', result.error);
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error caught in useAuth:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during login process.';
      console.error('Login error message:', errorMessage);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    if (IS_LOGIN_DISABLED_FOR_TESTING) {
      setUser(null);
      // console.log("Logout called in test mode. User set to null."); // Optional log
      return;
    }
    setUser(null);
    localStorage.removeItem('user');
    setIsLoading(false);
  };

  const contextValue = { user, isLoading, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
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
