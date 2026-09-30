import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { Product, Order, Category, OrderStatus } from '../types/index.ts';
import { formatPrice, formatShortDate } from '../utils/formatters.ts';
import {
  Store,
  Package,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Search,
  Filter,
  Loader2,
  DollarSign,
} from 'lucide-react';

interface SellerDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({ onNavigate }) => {
  const { user, seller, role, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal for Add/Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    categoryId: '',
    stock: '',
    sku: '',
    brand: '',
    imageUrl: '',
  });
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      onNavigate('/login');
      return;
    }
    if (role !== 'SELLER' && role !== 'ADMIN') {
      showToast('Sotuvchi paneliga faqat sotuvchilar kira oladi', 'error');
      onNavigate('/seller/register');
      return;
    }

    loadSellerData();
  }, [isAuthenticated, role]);

  const loadSellerData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, prodsRes, ordersRes, catsRes] = await Promise.all([
        api.seller.getDashboard(),
        api.seller.getProducts(),
        api.seller.getOrders(),
        api.categories.getAll(),
      ]);

      if (dashRes.data?.success) setDashboardData(dashRes.data.data);
      if (prodsRes.data?.success) setProducts(prodsRes.data.data);
      if (ordersRes.data?.success) setOrders(ordersRes.data.data);
      if (catsRes.data?.success) {
        setCategories(catsRes.data.data);
        if (catsRes.data.data.length > 0 && !productForm.categoryId) {
          setProductForm(prev => ({ ...prev, categoryId: catsRes.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      oldPrice: '',
      categoryId: categories[0]?.id || '',
      stock: '10',
      sku: 'SKU-' + Math.floor(1000 + Math.random() * 9000),
      brand: '',
      imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: String(prod.price),
      oldPrice: prod.oldPrice ? String(prod.oldPrice) : '',
      categoryId: prod.categoryId,
      stock: String(prod.stock),
      sku: prod.sku,
      brand: prod.brand || '',
      imageUrl: prod.images[0] || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      showToast('Iltimos, barcha majburiy maydonlarni to‘ldiring', 'error');
      return;
    }

    try {
      setIsSavingProduct(true);
      const payload = {
        name: productForm.name,
        description: productForm.description || productForm.name,
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
        categoryId: productForm.categoryId,
        stock: Number(productForm.stock) || 0,
        sku: productForm.sku,
        brand: productForm.brand || undefined,
        images: [productForm.imageUrl || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'],
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id, payload);
        showToast('Mahsulot muvaffaqiyatli yangilandi!', 'success');
      } else {
        await api.products.create(payload);
        showToast('Yangi mahsulot do‘konga qo‘shildi!', 'success');
      }

      setIsProductModalOpen(false);
      loadSellerData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?')) return;
    try {
      await api.products.delete(productId);
      showToast('Mahsulot o‘chirildi', 'info');
      loadSellerData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'O‘chirishda xatolik', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      showToast(`Buyurtma holati "${newStatus}" ga o‘zgartirildi`, 'success');
      loadSellerData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Xatolik', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-xs text-gray-500 font-semibold">Sotuvchi paneli yuklanmoqda...</p>
      </div>
    );
  }

  const stats = dashboardData?.statistics || {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-linear-to-r from-emerald-900 to-teal-900 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-400/20">
              Sotuvchi Kabineti
            </span>
            <span className="text-xs text-emerald-200">★ {seller?.rating || 5.0} Reyting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {seller?.storeName || 'TechnoMall O‘zbekiston'}
          </h1>
          <p className="text-xs text-emerald-100 max-w-lg">
            Mahsulotlaringizni qo‘shing, buyurtmalarni boshqaring va sotuvlar statistikasini kuzatib boring.
          </p>
        </div>

        <button
          onClick={openAddProductModal}
          className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Yangi mahsulot qo‘shish</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-2">
        {[
          { id: 'overview', label: 'Umumiy hisobot' },
          { id: 'products', label: `Mahsulotlar (${products.length})` },
          { id: 'orders', label: `Buyurtmalar (${orders.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-600'
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
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold">Jami daromad</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900">
                {formatPrice(stats.totalRevenue)}
              </p>
              <span className="text-[10px] text-emerald-600 font-semibold block">Sotilgan tovarlar bo‘yicha</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold">Buyurtmalar</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{stats.totalOrders} ta</p>
              <span className="text-[10px] text-gray-400 block">Jami mijozlar xaridlari</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold">Tovarlar soni</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-gray-900">{stats.totalProducts} ta</p>
              <span className="text-[10px] text-purple-600 font-semibold block">{stats.activeProducts} ta faol</span>
            </div>

            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold">Kam qolgan tovarlar</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-600">{stats.lowStockProducts} ta</p>
              <span className="text-[10px] text-amber-700 block">Omborda 5 tadan kam</span>
            </div>
          </div>

          {/* Recent Orders table */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900">Oxirgi buyurtmalar</h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Barcha buyurtmalar &rarr;
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Hozircha buyurtmalar mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-3">Raqam</th>
                      <th className="p-3">Mijoz</th>
                      <th className="p-3">Summa</th>
                      <th className="p-3">Holati</th>
                      <th className="p-3">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id} className="hover:bg-gray-50/50">
                        <td className="p-3 font-mono font-bold text-gray-900">{o.orderNumber}</td>
                        <td className="p-3 text-gray-700">{o.shippingAddress?.fullName}</td>
                        <td className="p-3 font-bold text-gray-900">{formatPrice(o.total)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-400">{formatShortDate(o.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Products Tab (CRUD) */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Mahsulotlar katalogi</h3>
              <p className="text-xs text-gray-500 mt-0.5">Do‘koningizdagi tovarlarni boshqaring</p>
            </div>
            <button
              onClick={openAddProductModal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 self-start shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Mahsulot qo‘shish</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Mahsulot</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Narx</th>
                  <th className="p-3">Qoldiq</th>
                  <th className="p-3">Reyting</th>
                  <th className="p-3 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images[0]}
                          alt=""
                          className="w-10 h-10 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 shrink-0"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-gray-900 truncate">{p.name}</p>
                          <span className="text-[10px] text-gray-400">{p.brand || 'Original'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-gray-600">{p.sku}</td>
                    <td className="p-3 font-bold text-gray-900">{formatPrice(p.price)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          p.stock <= 3
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.stock} dona
                      </span>
                    </td>
                    <td className="p-3 text-amber-500 font-bold">★ {p.rating.toFixed(1)}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => openEditProductModal(p)}
                        className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="O‘chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs space-y-4">
          <div className="pb-4 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900">Buyurtmalarni boshqarish</h3>
            <p className="text-xs text-gray-500 mt-0.5">Xaridorlar buyurtmalarini tasdiqlang va holatini o‘zgartiring</p>
          </div>

          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl border border-gray-100 bg-gray-50/40 space-y-4 hover:border-gray-200 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200/60">
                  <div>
                    <span className="font-mono font-bold text-xs text-gray-900">
                      {order.orderNumber}
                    </span>
                    <p className="text-[11px] text-gray-500">
                      Mijoz: <strong>{order.shippingAddress?.fullName}</strong> ({order.shippingAddress?.phone})
                    </p>
                  </div>

                  {/* Status change select */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-700">Holat:</span>
                    <select
                      value={order.status}
                      onChange={e => handleUpdateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="PENDING">Kutilmoqda (PENDING)</option>
                      <option value="CONFIRMED">Tasdiqlandi (CONFIRMED)</option>
                      <option value="PROCESSING">Tayyorlanmoqda (PROCESSING)</option>
                      <option value="SHIPPED">Yetkazilmoqda (SHIPPED)</option>
                      <option value="DELIVERED">Yetkazildi (DELIVERED)</option>
                      <option value="CANCELLED">Bekor qilindi (CANCELLED)</option>
                    </select>
                  </div>
                </div>

                {/* Items in order */}
                <div className="space-y-2">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}
                          alt=""
                          className="w-7 h-7 rounded-lg object-contain bg-white border p-0.5"
                        />
                        <span className="font-medium text-gray-900">{item.name} × {item.quantity}</span>
                      </div>
                      <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
                  <span>Manzil: {order.shippingAddress?.region}, {order.shippingAddress?.city}, {order.shippingAddress?.addressLine}</span>
                  <span className="font-bold text-xs text-emerald-600">Jami: {formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div onClick={() => setIsProductModalOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-xs" />

          <div className="relative w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">
                {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo‘shish'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Mahsulot nomi *</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="Masalan: Apple iPhone 15 Pro Max 256GB"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Narxi (so‘m) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={e => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="15000000"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Eski narxi (ixtiyoriy)</label>
                  <input
                    type="number"
                    value={productForm.oldPrice}
                    onChange={e => setProductForm({ ...productForm, oldPrice: e.target.value })}
                    placeholder="16500000"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Kategoriya *</label>
                  <select
                    value={productForm.categoryId}
                    onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900 font-medium"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Ombordagi miqdori *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={e => setProductForm({ ...productForm, stock: e.target.value })}
                    placeholder="15"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">SKU kodi *</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={e => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-700">Brend</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={e => setProductForm({ ...productForm, brand: e.target.value })}
                    placeholder="Apple, Samsung, Nike..."
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Rasm URL manzili</label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={e => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-gray-700">Tavsif</label>
                <textarea
                  rows={3}
                  value={productForm.description}
                  onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Mahsulot haqida batafsil ma’lumot..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs flex items-center gap-1.5"
                >
                  {isSavingProduct && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Saqlash' : 'Qo‘shish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
