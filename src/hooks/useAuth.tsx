'use client';

import {useState, createContext, useContext, ReactNode, useEffect} from 'react';
import {User as PrismaUser, Trainer as PrismaTrainer} from '@prisma/client';

interface AuthContextType {
  user: { id: string, role: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string, role: string } | null>(null);

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
    try {
      if (typeof window === 'undefined') {
        const {PrismaClient} = await import('@prisma/client');
        const prisma = new PrismaClient();

        const foundUser = await prisma.user.findUnique({
          where: {
            email: username,
          },
        });

        if (foundUser && username === foundUser.email && password === 'password') {
          const userDetails = {id: foundUser.id, role: foundUser.role};
          setUser(userDetails);
          localStorage.setItem('user', JSON.stringify(userDetails)); // Store user data.
          return true;
        }

        const foundTrainer = await prisma.trainer.findUnique({
          where: {
            email: username,
          },
        });

        if (foundTrainer && username === foundTrainer.email && password === 'password') {
          const userDetails = {id: foundTrainer.id, role: foundTrainer.role};
          setUser(userDetails);
          localStorage.setItem('user', JSON.stringify(userDetails)); // Store user data.
          return true;
        }

        await prisma.$disconnect(); // Disconnect after use
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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
