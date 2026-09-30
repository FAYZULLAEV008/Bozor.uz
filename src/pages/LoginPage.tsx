import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { Sparkles, ArrowRight, Loader2, Lock, Mail, Shield, Store, User } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, quickLogin, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    onNavigate('/profile');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Iltimos, barcha maydonlarni to‘ldiring', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const success = await login(email.trim(), password);
      if (success) {
        showToast('Xush kelibsiz!', 'success');
        onNavigate('/profile');
      }
    } catch (err: any) {
      showToast(err.message || 'Kirishda xatolik yuz berdi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuick = async (role: 'customer' | 'seller' | 'admin') => {
    try {
      setIsLoading(true);
      await quickLogin(role);
      showToast('Muvaffaqiyatli kirdingiz!', 'success');
      onNavigate(role === 'admin' ? '/admin' : role === 'seller' ? '/seller/dashboard' : '/profile');
    } catch (err: any) {
      showToast(err.message || 'Xatolik', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand logo & header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-lg shadow-emerald-600/30">
          B
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Hisobga kirish</h1>
        <p className="text-xs text-gray-500">
          BOZOR.UZ profilingizga kirish uchun ma’lumotlaringizni kiriting
        </p>
      </div>

      {/* Quick 1-Click Demo Logins */}
      <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Bir bosishda demo hisobga kirish:</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleQuick('customer')}
            className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:border-emerald-500 hover:shadow-xs transition-all"
          >
            <span className="font-bold text-[11px] text-gray-900 block">Xaridor</span>
            <span className="text-[9px] text-gray-500 block">user@bozor.uz</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuick('seller')}
            className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:border-emerald-500 hover:shadow-xs transition-all"
          >
            <span className="font-bold text-[11px] text-gray-900 block">Sotuvchi</span>
            <span className="text-[9px] text-gray-500 block">seller@bozor.uz</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuick('admin')}
            className="p-2 rounded-xl bg-white border border-amber-200 text-left hover:border-emerald-500 hover:shadow-xs transition-all"
          >
            <span className="font-bold text-[11px] text-gray-900 block">Admin</span>
            <span className="text-[9px] text-gray-500 block">admin@bozor.uz</span>
          </button>
        </div>
      </div>

      {/* Login form */}
      <form onSubmit={handleLogin} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Elektron pochta</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="user@bozor.uz"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900 font-medium"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Parol</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-gray-500">
          Hisobingiz yo‘qmi?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/register')}
            className="text-emerald-600 font-bold hover:underline"
          >
            Ro‘yxatdan o‘tish
          </button>
        </div>
      </form>
    </div>
  );
};
