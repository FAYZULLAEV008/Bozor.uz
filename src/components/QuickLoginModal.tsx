import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { Shield, Store, User as UserIcon, X, ArrowRight, Loader2 } from 'lucide-react';

interface QuickLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRegularLogin?: () => void;
}

export const QuickLoginModal: React.FC<QuickLoginModalProps> = ({ isOpen, onClose, onOpenRegularLogin }) => {
  const { quickLogin } = useAuth();
  const { showToast } = useNotification();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickLogin = async (role: 'customer' | 'seller' | 'admin') => {
    try {
      setLoadingRole(role);
      await quickLogin(role);
      const roleNames = {
        customer: 'Xaridor (Anvar Karimov)',
        seller: 'Sotuvchi (TechnoMall)',
        admin: 'Administrator (Dilshod Rahmatov)',
      };
      showToast(`${roleNames[role]} sifatida tizimga kirdingiz!`, 'success');
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Kirishda xatolik yuz berdi', 'error');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Tezkor Demo Kirish</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Platformani sinab ko‘rish uchun 3 ta roldan birini tanlang
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles Cards */}
        <div className="space-y-3">
          {/* Customer */}
          <button
            onClick={() => handleQuickLogin('customer')}
            disabled={loadingRole !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Xaridor (Customer)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-md font-semibold">
                    user@bozor.uz
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Qidirish, savat, buyurtma berish, sharh qoldirish
                </p>
              </div>
            </div>
            {loadingRole === 'customer' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            )}
          </button>

          {/* Seller */}
          <button
            onClick={() => handleQuickLogin('seller')}
            disabled={loadingRole !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Sotuvchi (Seller)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-md font-semibold">
                    seller@bozor.uz
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  TechnoMall do‘koni: tovarlar CRUD, buyurtmalar boshqaruvi
                </p>
              </div>
            </div>
            {loadingRole === 'seller' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            )}
          </button>

          {/* Admin */}
          <button
            onClick={() => handleQuickLogin('admin')}
            disabled={loadingRole !== null}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">Admin (Administrator)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-md font-semibold">
                    admin@bozor.uz
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Foydalanuvchilar, sotuvchilar, tovarlar, statistikalar
                </p>
              </div>
            </div>
            {loadingRole === 'admin' ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            ) : (
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
            )}
          </button>
        </div>

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Yoki o‘zingiz ro‘yxatdan o‘ting:</span>
          {onOpenRegularLogin && (
            <button
              onClick={() => {
                onClose();
                onOpenRegularLogin();
              }}
              className="text-emerald-600 font-semibold hover:underline"
            >
              Kirish / Ro‘yxatdan o‘tish
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
