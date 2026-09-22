import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { StorageService, subscribeToStorage } from '../services/storageService';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isCustomer: boolean;
  login: (email: string, password?: string) => { success: boolean; message?: string };
  signup: (name: string, email: string, phone: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with default customer or admin if stored, else default to Sarah Mathew (customer) so the app is instantly active
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = StorageService.getCurrentUser();
    if (saved) return saved;
    // Default to Sarah (customer) for instant preview experience
    const defaultSarah = StorageService.getUsers().find((u) => u.id === 'usr_sarah') || null;
    return defaultSarah;
  });

  useEffect(() => {
    const unsubscribe = subscribeToStorage(() => {
      const updatedUser = StorageService.getCurrentUser();
      setCurrentUserState(updatedUser);
    });
    return unsubscribe;
  }, []);

  const login = (email: string): { success: boolean; message?: string } => {
    const user = StorageService.getUserByEmail(email);
    if (!user) {
      return { success: false, message: 'No account found with this email address. Please register.' };
    }
    StorageService.setCurrentUser(user);
    setCurrentUserState(user);
    return { success: true };
  };

  const signup = (name: string, email: string, phone: string): { success: boolean; message?: string } => {
    const existing = StorageService.getUserByEmail(email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please log in.' };
    }

    const newUser: User = {
      id: `usr_${Date.now().toString(36)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: email.toLowerCase().includes('admin') ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
    };

    StorageService.saveUser(newUser);
    StorageService.setCurrentUser(newUser);
    setCurrentUserState(newUser);
    return { success: true };
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUserState(null);
  };

  const switchUser = (userId: string) => {
    const user = StorageService.getUsers().find((u) => u.id === userId);
    if (user) {
      StorageService.setCurrentUser(user);
      setCurrentUserState(user);
    }
  };

  const isAdmin = currentUser?.role === 'admin';
  const isCustomer = currentUser?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        isCustomer,
        login,
        signup,
        logout,
        switchUser,
      }}
    >
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
