import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { useFavorites } from '../context/FavoritesContext.tsx';
import { api } from '../services/api.ts';
import { Order } from '../types/index.ts';
import { formatPrice, formatShortDate } from '../utils/formatters.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import {
  User,
  Package,
  Heart,
  MapPin,
  Lock,
  LogOut,
  Store,
  Shield,
  ChevronRight,
  Loader2,
  CheckCircle,
} from 'lucide-react';

interface ProfilePageProps {
  onNavigate: (path: string) => void;
  initialTab?: 'personal' | 'orders' | 'favorites' | 'addresses' | 'security';
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate, initialTab = 'personal' }) => {
  const { user, seller, role, logout, refreshUser, isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const { favorites } = useFavorites();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Edit profile form
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('/login');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
    }
  }, [user]);

  // Load orders when activeTab is orders
  useEffect(() => {
    if (activeTab === 'orders' && isAuthenticated) {
      const loadOrders = async () => {
        try {
          setIsLoadingOrders(true);
          const res = await api.orders.getAll();
          if (res.data?.success) {
            setOrders(res.data.data);
          }
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Buyurtmalarni yuklashda xatolik', 'error');
        } finally {
          setIsLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [activeTab, isAuthenticated]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingProfile(true);
      const res = await api.auth.updateProfile({ name, phone });
      if (res.data?.success) {
        showToast('Profil ma’lumotlari muvaffaqiyatli saqlandi!', 'success');
        refreshUser();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast('Yangi parollar bir-biriga mos kelmadi', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak', 'error');
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await api.auth.changePassword({ oldPassword, newPassword });
      if (res.data?.success) {
        showToast('Parolingiz muvaffaqiyatli yangilandi!', 'success');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsChangingPass(false);
    }
  };

  if (!user) return null;

  const statusBadge = (status: string) => {
    const config: Record<string, { bg: string; label: string }> = {
      PENDING: { bg: 'bg-amber-100 text-amber-800', label: 'Kutilmoqda' },
      CONFIRMED: { bg: 'bg-blue-100 text-blue-800', label: 'Tasdiqlandi' },
      PROCESSING: { bg: 'bg-indigo-100 text-indigo-800', label: 'Tayyorlanmoqda' },
      SHIPPED: { bg: 'bg-cyan-100 text-cyan-800', label: 'Yetkazilmoqda' },
      DELIVERED: { bg: 'bg-emerald-100 text-emerald-800', label: 'Yetkazildi' },
      CANCELLED: { bg: 'bg-rose-100 text-rose-800', label: 'Bekor qilingan' },
    };
    const c = config[status] || { bg: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${c.bg}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Profile Hero */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-50" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-emerald-600/20">
              {user.name.charAt(0)}
            </div>
          )}
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-xs text-gray-500 font-mono">{user.phone} • {user.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Rol: {role}
              </span>
              {seller && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800">
                  Do‘kon: {seller.storeName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick action buttons depending on role */}
        <div className="flex flex-wrap gap-2">
          {role === 'SELLER' && (
            <button
              onClick={() => onNavigate('/seller/dashboard')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Sotuvchi paneli</span>
            </button>
          )}

          {role === 'ADMIN' && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin boshqaruvi</span>
            </button>
          )}

          {role === 'CUSTOMER' && (
            <button
              onClick={() => onNavigate('/seller/register')}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Store className="w-4 h-4" />
              <span>Sotuvchi bo‘lish</span>
            </button>
          )}

          <button
            onClick={() => {
              logout();
              onNavigate('/');
            }}
            className="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            title="Chiqish"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs and Main section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Navigation Menu (3 cols) */}
        <aside className="lg:col-span-3 bg-white p-3 rounded-3xl border border-gray-100 shadow-xs space-y-1">
          {[
            { id: 'personal', label: 'Shaxsiy ma’lumotlar', icon: User },
            { id: 'orders', label: 'Buyurtmalarim', icon: Package },
            { id: 'favorites', label: 'Sevimlilarim', icon: Heart },
            { id: 'addresses', label: 'Saqlangan manzillar', icon: MapPin },
            { id: 'security', label: 'Xavfsizlik va parol', icon: Lock },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-700/20'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-300'}`} />
              </button>
            );
          })}
        </aside>

        {/* Right: Tab Contents (9 cols) */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-xs min-h-[400px]">
          {/* 1. Personal Information */}
          {activeTab === 'personal' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Shaxsiy ma’lumotlarni tahrirlash</h2>
                <p className="text-xs text-gray-500 mt-0.5">Ism va telefon raqamingizni yangilang</p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">To‘liq ismingiz</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Elektron pochta (o‘zgarmas)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-xs text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Telefon raqam</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isUpdatingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>O‘zgarishlarni saqlash</span>
                </button>
              </form>
            </div>
          )}

          {/* 2. Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Mening buyurtmalarim</h2>
                <p className="text-xs text-gray-500 mt-0.5">Barcha xaridlar tarixi va yetkazib berish holati</p>
              </div>

              {isLoadingOrders ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                </div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-3">
                  <Package className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm font-semibold text-gray-700">Siz hali buyurtma bermagansiz</p>
                  <button
                    onClick={() => onNavigate('/')}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Mahsulotlarni ko‘rish
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div
                      key={order.id}
                      className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-4 hover:border-emerald-200 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-200/60">
                        <div className="space-y-0.5">
                          <span className="font-mono font-extrabold text-xs text-gray-900">
                            {order.orderNumber}
                          </span>
                          <p className="text-[11px] text-gray-400">
                            Sana: {formatShortDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {statusBadge(order.status)}
                          <span className="text-xs font-extrabold text-gray-900">
                            {formatPrice(order.total)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 max-w-sm truncate">
                              <img
                                src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}
                                alt=""
                                className="w-7 h-7 rounded-lg object-contain bg-white border border-gray-100 p-0.5"
                              />
                              <span className="truncate text-gray-800 font-medium">
                                {item.name} × {item.quantity} dona
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">
                          Manzil: {order.shippingAddress?.region}, {order.shippingAddress?.city}
                        </span>
                        <button
                          onClick={() => onNavigate(`/order/${order.id}`)}
                          className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                        >
                          <span>Kuzatish</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Favorites */}
          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sevimli mahsulotlar ({favorites.length})</h2>
                <p className="text-xs text-gray-500 mt-0.5">Sizga yoqqan va keyinroq xarid qilish uchun saqlangan tovarlar</p>
              </div>

              {favorites.length === 0 ? (
                <div className="py-12 text-center text-gray-400 space-y-3">
                  <Heart className="w-12 h-12 mx-auto stroke-1" />
                  <p className="text-sm font-semibold text-gray-700">Sevimli mahsulotlaringiz yo‘q</p>
                  <button
                    onClick={() => onNavigate('/')}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Tovarlarni ko‘rish
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map(prod => (
                    <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 4. Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Saqlangan manzillar</h2>
                <p className="text-xs text-gray-500 mt-0.5">Buyurtmalarni tezkor rasmiylashtirish uchun manzilingiz</p>
              </div>

              <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-emerald-600" /> Uy manzili
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">
                    Asosiy manzil
                  </span>
                </div>
                <p className="text-xs text-gray-700">
                  Toshkent shahri, Yunusobod tumani, Amir Temur ko‘chasi, 107A-uy, 45-xonadon
                </p>
                <p className="text-[11px] text-gray-500 font-mono">+998 97 111 22 33</p>
              </div>
            </div>
          )}

          {/* 5. Security */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Xavfsizlik va parolni o‘zgartirish</h2>
                <p className="text-xs text-gray-500 mt-0.5">Hisobingiz xavfsizligini ta’minlash uchun parolingizni muntazam yangilang</p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Joriy parol</label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Yangi parol (kamida 6 ta belgi)</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Yangi parolni tasdiqlang</label>
                  <input
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={e => setConfirmNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 disabled:opacity-50"
                >
                  {isChangingPass && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Parolni yangilash</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
