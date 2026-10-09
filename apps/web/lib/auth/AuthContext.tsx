'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { errorLogger } from '@/lib/utils/error-logger';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔍 [AUTH CONTEXT] checkAuth called');
    
    // Get token from cookies instead of localStorage
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='))
      ?.split('=')[1];
      
    console.log('🍪 [AUTH CONTEXT] Cookie token found:', !!token);
      
    if (!token) {
      console.log('❌ [AUTH CONTEXT] No token found, setting loading false');
      setLoading(false);
      return;
    }

    console.log('🌐 [AUTH CONTEXT] Sending verify request...');
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('📡 [AUTH CONTEXT] Verify response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [AUTH CONTEXT] Verify successful, user:', data.user);
        setUser(data.user);
      } else {
        console.log('❌ [AUTH CONTEXT] Verify failed, removing token');
        // Remove token cookie instead of localStorage
        document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error) {
      console.error('💥 [AUTH CONTEXT] Verify error:', error);
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔵 [AUTH CONTEXT] Login function called');
    console.log('📧 Email:', email);
    
    try {
      console.log('🌐 [AUTH CONTEXT] Sending request to /api/auth/login...');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('📡 [AUTH CONTEXT] Response status:', response.status);
      console.log('📡 [AUTH CONTEXT] Response ok:', response.ok);

      if (!response.ok) {
        const data = await response.json();
        console.error('❌ [AUTH CONTEXT] Login failed:', data);
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ [AUTH CONTEXT] Login successful, data:', data);
      
      // Set token in cookie - remove secure flag for development
      const isProduction = process.env.NODE_ENV === 'production';
      const cookieOptions = isProduction 
        ? `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
        : `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
      
      console.log('🍪 [AUTH CONTEXT] Setting cookie with options:', cookieOptions);
      document.cookie = cookieOptions;
      console.log('🍪 [AUTH CONTEXT] Token saved to cookie');
      
      setUser(data.user);
      console.log('👤 [AUTH CONTEXT] User set:', data.user);
      
      console.log('🔀 [AUTH CONTEXT] About to redirect to /dashboard...');
      router.push('/dashboard');
      console.log('🔀 [AUTH CONTEXT] router.push called');
      
      // Add a small delay to see if the redirect happens
      setTimeout(() => {
        console.log('🔀 [AUTH CONTEXT] After timeout - current URL should be /dashboard');
        console.log('🔀 [AUTH CONTEXT] Current URL:', window.location.href);
      }, 1000);
    } catch (error) {
      console.error('💥 [AUTH CONTEXT] Unexpected error:', error);
      errorLogger.log(error as Error, 'AuthContext:login', { email });
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Registration failed');
    }

    const data = await response.json();
    // Set token in cookie - remove secure flag for development
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = isProduction 
      ? `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`
      : `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
    
    document.cookie = cookieOptions;
    setUser(data.user);
    router.push('/dashboard');
  };

  const logout = () => {
    // Remove token cookie instead of localStorage
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

