import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabaseService } from '../services/supabaseService';
import { APP_CONFIG } from '../config/constants';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
    metadata?: any;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = supabaseService.getClient();

  useEffect(() => {
    initializeAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Load user profile data
          await refreshUserProfile(session.user.id);
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
      
      if (data.session?.user) {
        await refreshUserProfile(data.session.user.id);
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserProfile = async (userId: string) => {
    try {
      const profile = await supabaseService.getUserProfile(userId);
      if (profile && user) {
        // Merge profile data with user metadata
        setUser({
          ...user,
          user_metadata: {
            ...user.user_metadata,
            ...profile,
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const result = await supabaseService.loginUser(email, password);
      return result;
    } catch (error) {
      return { success: false, error: 'Giriş işlemi başarısız' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: string;
    metadata?: any;
  }) => {
    setLoading(true);
    
    try {
      const result = await supabaseService.registerUser(userData);
      return result;
    } catch (error) {
      return { success: false, error: 'Kayıt işlemi başarısız' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: any): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await supabaseService.updateUserProfile(user.id, updates);
      
      if (success) {
        await refreshUserProfile(user.id);
      }
      
      return success;
    } catch (error) {
      console.error('Profile update failed:', error);
      return false;
    }
  };

  const refreshUser = async () => {
    if (user) {
      await refreshUserProfile(user.id);
    }
  };

  const logout = async () => {
    setLoading(false);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      
      // Clear sensitive data
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      login, 
      register, 
      logout, 
      updateProfile, 
      refreshUser 
    }}>
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