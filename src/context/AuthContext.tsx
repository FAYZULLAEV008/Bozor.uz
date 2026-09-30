import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Seller, Role } from '../types/index.ts';
import { api } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  seller: Seller | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: Role | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickLogin: (roleType: 'customer' | 'seller' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bozor_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [seller, setSeller] = useState<Seller | null>(() => {
    const saved = localStorage.getItem('bozor_seller');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('bozor_access_token');
    if (!token) {
      setUser(null);
      setSeller(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res.data?.success) {
        const u = res.data.data.user;
        const s = res.data.data.seller;
        setUser(u);
        setSeller(s);
        localStorage.setItem('bozor_user', JSON.stringify(u));
        if (s) {
          localStorage.setItem('bozor_seller', JSON.stringify(s));
        } else {
          localStorage.removeItem('bozor_seller');
        }
      }
    } catch (err) {
      // Token may be invalid
      console.warn('Failed to fetch user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogoutEvent = () => {
      setUser(null);
      setSeller(null);
    };

    window.addEventListener('auth:logout', handleLogoutEvent);
    return () => window.removeEventListener('auth:logout', handleLogoutEvent);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.auth.login({ email, password: pass });
      if (res.data?.success) {
        const { user: loggedUser, seller: loggedSeller, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('bozor_access_token', accessToken);
        localStorage.setItem('bozor_refresh_token', refreshToken);
        localStorage.setItem('bozor_user', JSON.stringify(loggedUser));
        if (loggedSeller) {
          localStorage.setItem('bozor_seller', JSON.stringify(loggedSeller));
        } else {
          localStorage.removeItem('bozor_seller');
        }
        setUser(loggedUser);
        setSeller(loggedSeller || null);

        // trigger sync cart event
        window.dispatchEvent(new Event('auth:login'));
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Kirishda xatolik yuz berdi');
    }
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      const res = await api.auth.register(data);
      if (res.data?.success) {
        const { user: registeredUser, accessToken, refreshToken } = res.data.data;
        localStorage.setItem('bozor_access_token', accessToken);
        localStorage.setItem('bozor_refresh_token', refreshToken);
        localStorage.setItem('bozor_user', JSON.stringify(registeredUser));
        setUser(registeredUser);
        setSeller(null);
        window.dispatchEvent(new Event('auth:login'));
        return true;
      }
      return false;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
    }
  };

  const logout = () => {
    localStorage.removeItem('bozor_access_token');
    localStorage.removeItem('bozor_refresh_token');
    localStorage.removeItem('bozor_user');
    localStorage.removeItem('bozor_seller');
    setUser(null);
    setSeller(null);
    window.dispatchEvent(new Event('auth:logout'));
  };

  const quickLogin = async (roleType: 'customer' | 'seller' | 'admin') => {
    const creds = {
      customer: { email: 'user@bozor.uz', pass: 'user123' },
      seller: { email: 'seller@bozor.uz', pass: 'seller123' },
      admin: { email: 'admin@bozor.uz', pass: 'admin123' },
    }[roleType];

    await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        seller,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        login,
        register,
        logout,
        refreshUser,
        quickLogin,
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
