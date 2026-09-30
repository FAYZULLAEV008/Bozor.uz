import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Store, ShieldCheck, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface SellerRegisterPageProps {
  onNavigate: (path: string) => void;
}

export const SellerRegisterPage: React.FC<SellerRegisterPageProps> = ({ onNavigate }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useNotification();

  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(user?.phone || '+998');
  const [address, setAddress] = useState('Toshkent sh., Chilonzor tumani');
  const [logo, setLogo] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Sotuvchi bo‘lish uchun avval tizimga kiring', 'info');
      onNavigate('/login');
      return;
    }

    if (!storeName.trim()) {
      showToast('Iltimos, do‘kon nomini kiriting', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.seller.register({
        storeName: storeName.trim(),
        description: description.trim(),
        phone: phone.trim(),
        address: address.trim(),
        logo: logo.trim(),
      });

      if (res.data?.success) {
        showToast('Tabriklaymiz! Do‘koningiz muvaffaqiyatli ochildi!', 'success');
        await refreshUser();
        onNavigate('/seller/dashboard');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Ro‘yxatdan o‘tishda xatolik', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          BOZOR.UZ da sotuvchi bo‘ling
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          O‘z do‘koningizni bir daqiqada oching va O‘zbekiston bo‘ylab minglab yangi mijozlarga ega bo‘ling.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5 text-xs">
        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Do‘kon nomi (Brend) *</label>
          <input
            type="text"
            required
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
            placeholder="Masalan: TechnoMall O‘zbekiston, ModaStyle..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900 font-medium"
          />
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Do‘kon tavsifi</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Qanday mahsulotlar sotasiz, afzalliklaringiz va yetkazib berish..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Aloqa telefoni *</label>
            <input
              type="text"
              required
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-gray-700">Joylashuv manzili</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Toshkent sh., Chilonzor tumani..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="font-semibold text-gray-700">Do‘kon logotipi (URL manzil)</label>
          <input
            type="url"
            value={logo}
            onChange={e => setLogo(e.target.value)}
            placeholder="https://..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:border-emerald-500 text-gray-900 font-mono"
          />
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 flex items-center gap-3 text-emerald-800">
          <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600" />
          <p className="text-[11px] leading-relaxed">
            Ro‘yxatdan o‘tish bepul. Tizim avtomatik tarzda sizga SELLER rolini beradi va do‘kon kabinetini faollashtiradi.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Do‘konni ochish</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
