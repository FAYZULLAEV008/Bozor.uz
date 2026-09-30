import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { ArrowRight, Loader2, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';

interface RegisterPageProps {
  onNavigate: (path: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const { register, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    onNavigate('/profile');
    return null;
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast('Parollar bir-biriga mos kelmadi', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Parol kamida 6 ta belgidan iborat bo‘lishi kerak', 'error');
      return;
    }

    try {
      setIsLoading(true);
      const success = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        confirmPassword,
      });

      if (success) {
        showToast('Muvaffaqiyatli ro‘yxatdan o‘tdingiz! Xush kelibsiz.', 'success');
        onNavigate('/profile');
      }
    } catch (err: any) {
      showToast(err.message || 'Ro‘yxatdan o‘tishda xatolik', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-2xl mx-auto shadow-lg shadow-emerald-600/30">
          B
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Ro‘yxatdan o‘tish</h1>
        <p className="text-xs text-gray-500">
          BOZOR.UZ da yangi hisob yarating va minglab mahsulotlarni qulay xarid qiling
        </p>
      </div>

      <form onSubmit={handleRegister} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-gray-700">To‘liq ism (Ism Familiya)</label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Anvar Karimov"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
            />
            <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Elektron pochta</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.uz"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Telefon raqam</label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900 font-mono"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Parol (kamida 6 ta belgi)</label>
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

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Parolni tasdiqlang</label>
          <div className="relative">
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-xs"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ro‘yxatdan o‘tish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="pt-2 text-center text-xs text-gray-500">
          Hisobingiz bormi?{' '}
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-emerald-600 font-bold hover:underline"
          >
            Kirish
          </button>
        </div>
      </form>
    </div>
  );
};
