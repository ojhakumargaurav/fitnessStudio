'use client';

import {useState, createContext, useContext, ReactNode, useEffect} from 'react';

interface AuthContextType {
  user: { role: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
  const [user, setUser] = useState<{ role: string } | null>(null);

  useEffect(() => {
    // Check local storage for stored user data on initial load.
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data from local storage:', error);
        localStorage.removeItem('user'); // Clear invalid data
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Dummy authentication logic (replace with real API calls)
    if (username === 'user' && password === 'password') {
      const userDetails = {role: 'user'};
      setUser(userDetails);
      localStorage.setItem('user', JSON.stringify(userDetails)); // Store user data.
      return true;
    } else if (username === 'trainer' && password === 'password') {
      const userDetails = {role: 'trainer'};
      setUser(userDetails);
      localStorage.setItem('user', JSON.stringify(userDetails)); // Store user data.
      return true;
    } else if (username === 'admin' && password === 'password') {
      const userDetails = {role: 'admin'};
      setUser(userDetails);
      localStorage.setItem('user', JSON.stringify(userDetails)); // Store user data.
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Clear stored user data on logout.
  };

  return (
    <AuthContext.Provider value={{user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

