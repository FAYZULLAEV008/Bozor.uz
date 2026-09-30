import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { User, Seller, Product, Order, Category } from '../types/index.ts';
import { formatPrice, formatShortDate } from '../utils/formatters.ts';
import {
  Shield,
  Users,
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Search,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Loader2,
  X,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { user, role, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'sellers' | 'products' | 'categories' | 'orders'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [sellersList, setSellersList] = useState<Seller[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search filter inside admin
  const [searchUser, setSearchUser] = useState('');

  // Category modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catIcon, setCatIcon] = useState('Box');

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('/login');
      return;
    }
    if (role !== 'ADMIN') {
      showToast('Admin panelga faqat administratorlar kira oladi', 'error');
      onNavigate('/');
      return;
    }

    loadAdminData();
  }, [isAuthenticated, role]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, usersRes, sellersRes, prodsRes, catsRes, ordersRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getUsers(),
        api.admin.getSellers(),
        api.admin.getProducts(),
        api.categories.getAll({ includeInactive: 'true' }),
        api.admin.getOrders(),
      ]);

      if (dashRes.data?.success) setDashboardData(dashRes.data.data);
      if (usersRes.data?.success) setUsersList(usersRes.data.data);
      if (sellersRes.data?.success) setSellersList(sellersRes.data.data);
      if (prodsRes.data?.success) setProductsList(prodsRes.data.data);
      if (catsRes.data?.success) setCategoriesList(catsRes.data.data);
      if (ordersRes.data?.success) setOrdersList(ordersRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      await api.admin.updateUserRole(userId, newRole);
      showToast('Foydalanuvchi roli yangilandi', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(userId, nextStatus);
      showToast(`Foydalanuvchi ${nextStatus === 'ACTIVE' ? 'faollashtirildi' : 'bloklandi'}`, 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  const handleUpdateSellerStatus = async (sellerId: string, status: string) => {
    try {
      await api.admin.updateSellerStatus(sellerId, status);
      showToast(`Sotuvchi holati: ${status}`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  const handleUpdateProductStatus = async (productId: string, status: string) => {
    try {
      await api.admin.updateProductStatus(productId, status);
      showToast(`Mahsulot holati: ${status}`, 'success');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName || !catSlug) return;
    try {
      await api.categories.create({ name: catName, slug: catSlug, icon: catIcon });
      showToast('Yangi kategoriya yaratildi', 'success');
      setIsCategoryModalOpen(false);
      setCatName('');
      setCatSlug('');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!confirm('Ushbu kategoriyani o‘chirmoqchimisiz?')) return;
    try {
      await api.categories.delete(catId);
      showToast('Kategoriya o‘chirildi', 'info');
      loadAdminData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'O‘chirishda xatolik', 'error');
    }
  };

  const handleResetData = async () => {
    if (!confirm('DIQQAT! Bazadagi barcha ma’lumotlar boshlang‘ich demo holatiga qaytariladi. Davom etasizmi?')) return;
    try {
      setIsLoading(true);
      await api.admin.resetData();
      showToast('Baza muvaffaqiyatli qayta tiklandi!', 'success');
      loadAdminData();
    } catch (err: any) {
      showToast('Xatolik', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        <p className="text-xs text-gray-500 font-semibold">Admin boshqaruv paneli yuklanmoqda...</p>
      </div>
    );
  }

  const stats = dashboardData?.statistics || {
    totalUsers: usersList.length,
    totalSellers: sellersList.length,
    totalProducts: productsList.length,
    totalOrders: ordersList.length,
    totalRevenue: 0,
    pendingOrders: 0,
  };

  const filteredUsers = usersList.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.phone.includes(searchUser)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Admin Banner */}
      <div className="p-6 sm:p-8 bg-linear-to-r from-purple-950 via-gray-900 to-gray-950 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider border border-purple-400/20">
              Admin Boshqaruv Markazi
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            BOZOR.UZ Administrator Paneli
          </h1>
          <p className="text-xs text-gray-400 max-w-lg">
            Platforma foydalanuvchilari, sotuvchilar, barcha tovarlar va buyurtmalar ustidan to‘liq nazorat.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0"
          title="Demo bazani qayta tiklash"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo bazani yangilash</span>
        </button>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Hisobotlar' },
          { id: 'users', label: `Foydalanuvchilar (${usersList.length})` },
          { id: 'sellers', label: `Sotuvchilar (${sellersList.length})` },
          { id: 'products', label: `Mahsulotlar (${productsList.length})` },
          { id: 'categories', label: `Kategoriyalar (${categoriesList.length})` },
          { id: 'orders', label: `Buyurtmalar (${ordersList.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Umumiy daromad</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{formatPrice(stats.totalRevenue)}</p>
              <span className="text-[10px] text-emerald-600 font-semibold block">Platforma savdosi</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Jami xaridorlar</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalUsers} nafar</p>
              <span className="text-[10px] text-blue-600 font-semibold block">Ro‘yxatdan o‘tgan</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Sotuvchilar</span>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stats.totalSellers} ta do‘kon</p>
              <span className="text-[10px] text-purple-600 font-semibold block">Faol do‘konlar</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-gray-500">Kutilayotgan buyurtmalar</span>
              <p className="text-xl sm:text-2xl font-black text-amber-600">{stats.pendingOrders} ta</p>
              <span className="text-[10px] text-amber-700 font-semibold block">Tasdiqlash kutilmoqda</span>
            </div>
          </div>

          {/* Orders by status summary */}
          {dashboardData?.ordersByStatus && (
            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-gray-900">Buyurtmalar holati bo‘yicha taqsimot</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                {Object.entries(dashboardData.ordersByStatus).map(([status, count]: [string, any]) => (
                  <div key={status} className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-lg font-black text-gray-900 block">{count}</span>
                    <span className="text-[10px] text-gray-500 font-semibold uppercase">{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Users Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Foydalanuvchilar boshqaruvi</h3>
              <p className="text-xs text-gray-500 mt-0.5">Rollar va hisob holatini o‘zgartirish</p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Foydalanuvchini qidirish..."
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Foydalanuvchi</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Telefon</th>
                  <th className="p-3">Rol</th>
                  <th className="p-3">Holati</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-gray-900">{u.name}</td>
                    <td className="p-3 text-gray-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3 text-gray-600 font-mono text-[11px]">{u.phone}</td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={e => handleUpdateUserRole(u.id, e.target.value)}
                        className="px-2 py-1 rounded-lg border border-gray-200 bg-white font-bold text-[10px] text-gray-800"
                      >
                        <option value="CUSTOMER">CUSTOMER</option>
                        <option value="SELLER">SELLER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.status)}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Bloklash' : 'Faollashtirish'}
                      >
                        {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Sellers Tab */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100">
            Sotuvchilar do‘konlari
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Do‘kon nomi</th>
                  <th className="p-3">Telefon</th>
                  <th className="p-3">Reyting</th>
                  <th className="p-3">Holati</th>
                  <th className="p-3 text-right">Tasdiqlash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sellersList.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div className="font-bold text-gray-900">{s.storeName}</div>
                      <div className="text-[10px] text-gray-400">{s.address}</div>
                    </td>
                    <td className="p-3 font-mono">{s.phone}</td>
                    <td className="p-3 text-amber-500 font-bold">★ {s.rating}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {s.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, 'APPROVED')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px] hover:bg-emerald-100"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleUpdateSellerStatus(s.id, 'SUSPENDED')}
                        className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md font-bold text-[10px] hover:bg-rose-100"
                      >
                        To‘xtatish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100">
            Barcha mahsulotlar ({productsList.length} ta)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Mahsulot</th>
                  <th className="p-3">Narxi</th>
                  <th className="p-3">Qoldiq</th>
                  <th className="p-3">Holati</th>
                  <th className="p-3 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {productsList.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.images[0]} alt="" className="w-9 h-9 object-contain rounded-lg bg-gray-50 p-1" />
                        <div>
                          <p className="font-bold text-gray-900 truncate max-w-xs">{p.name}</p>
                          <span className="text-[10px] text-gray-400">{p.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="p-3">{p.stock} dona</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateProductStatus(p.id, 'APPROVED')}
                        className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]"
                      >
                        Tasdiqlash
                      </button>
                      <button
                        onClick={() => handleUpdateProductStatus(p.id, 'REJECTED')}
                        className="px-2 py-1 bg-rose-100 text-rose-800 rounded font-bold text-[10px]"
                      >
                        Rad etish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Categories Tab */}
      {activeTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Kategoriyalar CRUD</h3>
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Yangi kategoriya</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categoriesList.map(c => (
              <div key={c.id} className="p-3 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-900">{c.name}</h4>
                  <p className="text-[10px] text-gray-400 font-mono">slug: {c.slug}</p>
                </div>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100">
            Barcha buyurtmalar ({ordersList.length} ta)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Raqam</th>
                  <th className="p-3">Mijoz</th>
                  <th className="p-3">Summa</th>
                  <th className="p-3">To‘lov</th>
                  <th className="p-3">Holati</th>
                  <th className="p-3">Sana</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {ordersList.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-gray-900">{o.shippingAddress?.fullName}</p>
                      <span className="text-[10px] text-gray-400">{o.shippingAddress?.phone}</span>
                    </td>
                    <td className="p-3 font-bold text-gray-900">{formatPrice(o.total)}</td>
                    <td className="p-3 font-medium text-gray-700">{o.paymentMethod}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-[11px]">{formatShortDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Create Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCategoryModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-bold text-sm text-gray-900">Yangi kategoriya yaratish</h3>
              <button onClick={() => setIsCategoryModalOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="font-semibold text-gray-700">Nomi *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={e => {
                    setCatName(e.target.value);
                    if (!catSlug) setCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl mt-1 text-gray-900"
                />
              </div>
              <div>
                <label className="font-semibold text-gray-700">Slug *</label>
                <input
                  type="text"
                  required
                  value={catSlug}
                  onChange={e => setCatSlug(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border rounded-xl mt-1 text-gray-900 font-mono"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 border rounded-xl font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-xs"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
