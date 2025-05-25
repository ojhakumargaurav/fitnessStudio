
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

// Default user for testing when login is "disabled"
const defaultTestAdminUser: AuthenticatedUser = {
  id: 'test-admin-001',
  role: 'admin',
  status: 'active',
};

const IS_LOGIN_DISABLED_FOR_TESTING = true; // Set to true to disable login

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(IS_LOGIN_DISABLED_FOR_TESTING ? defaultTestAdminUser : null);
  const [isLoading, setIsLoading] = useState(IS_LOGIN_DISABLED_FOR_TESTING ? false : true); // No loading if login is disabled

  useEffect(() => {
    if (IS_LOGIN_DISABLED_FOR_TESTING) {
      setUser(defaultTestAdminUser);
      setIsLoading(false);
      return;
    }

    // Original logic to check local storage
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
      setUser(defaultTestAdminUser); // Ensure test user is set
      setIsLoading(false);
      return true; // Always successful for testing
    }

    setIsLoading(true);
    try {
      const result = await serverLogin(username, password);
      if (result.success && result.user) {
        setUser(result.user);
        localStorage.setItem('user', JSON.stringify(result.user));
        setIsLoading(false);
        return true;
      } else {
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
    if (IS_LOGIN_DISABLED_FOR_TESTING) {
      // To re-enable "login" for testing, set user to null.
      // Or, to keep it always "logged in" as admin, do nothing or reset to defaultTestAdminUser.
      // For now, let's allow logout to clear the user even in test mode.
      setUser(null);
      // localStorage.removeItem('user'); // Not strictly necessary if we're bypassing localStorage for login
      console.log("Logout called in test mode. User set to null.");
      return;
    }
    setUser(null);
    localStorage.removeItem('user');
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
