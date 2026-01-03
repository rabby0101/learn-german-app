import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, userDB } from '../services/userDatabase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (name: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  async function initializeAuth() {
    try {
      // Initialize user database
      await userDB.initialize();
      
      // Check for stored session
      const storedUserId = localStorage.getItem('learnGerman_currentUser');
      if (storedUserId) {
        const user = await userDB.getUserById(storedUserId);
        if (user) {
          setCurrentUser(user);
        } else {
          localStorage.removeItem('learnGerman_currentUser');
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      const user = await userDB.authenticateUser(credentials);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('learnGerman_currentUser', user.id);
        console.log('Login successful:', user.name);
        return true;
      } else {
        console.log('Login failed: Invalid credentials');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async function signup(name: string, password: string): Promise<boolean> {
    try {
      if (!name.trim() || !password.trim()) {
        throw new Error('Name and password are required');
      }
      
      if (password.length < 4) {
        throw new Error('Password must be at least 4 characters long');
      }

      const user = await userDB.createUser(name, password);
      setCurrentUser(user);
      localStorage.setItem('learnGerman_currentUser', user.id);
      console.log('Signup successful:', user.name);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem('learnGerman_currentUser');
    console.log('User logged out');
  }

  async function updateUserProfile(updates: Partial<User>): Promise<void> {
    if (!currentUser) {
      throw new Error('No user logged in');
    }

    try {
      const updatedUser = { ...currentUser, ...updates };
      await userDB.updateUser(updatedUser);
      setCurrentUser(updatedUser);
      console.log('User profile updated');
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  async function refreshUser(): Promise<void> {
    if (!currentUser) {
      return;
    }

    try {
      const user = await userDB.getUserById(currentUser.id);
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  }

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    signup,
    logout,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook for checking authentication status
export function useAuthStatus() {
  const { currentUser, loading } = useAuth();
  
  return {
    isAuthenticated: !!currentUser,
    isLoading: loading,
    user: currentUser
  };
}