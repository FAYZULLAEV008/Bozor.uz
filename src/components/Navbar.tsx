import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useFavorites } from '../context/FavoritesContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { NotificationDropdown } from './NotificationDropdown.tsx';
import { formatPrice } from '../utils/formatters.ts';
import { api } from '../services/api.ts';
import { Product } from '../types/index.ts';
import {
  Search,
  ShoppingCart,
  Heart,
  Bell,
  User as UserIcon,
  Menu,
  Shield,
  Store,
  LogOut,
  Sparkles,
  ChevronDown,
  X,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (path: string) => void;
  onOpenCategories: () => void;
  onOpenQuickLogin: () => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigate,
  onOpenCategories,
  onOpenQuickLogin,
  currentPath,
}) => {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { unreadCount } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.products.getAll({ q: searchQuery.trim(), limit: 5 });
        if (res.data?.success) {
          setSuggestions(res.data.data.products);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.warn('Search suggestions error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onNavigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setShowSuggestions(false);
    setSearchQuery('');
    onNavigate(`/product/${product.slug || product.id}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gray-900 text-gray-200 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>O‘zbekiston bo‘ylab tezkor yetkazib berish xizmati mavjud</span>
          </div>

          <div className="flex items-center gap-4 text-gray-300">
            <button
              onClick={onOpenQuickLogin}
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Hisoblarga Kirish</span>
            </button>
            <span>|</span>
            <span>Aloqa markazi: +998 71 200-00-00</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 md:gap-6">
        {/* Left: Brand Logo & Catalog Button */}
        <div className="flex items-center gap-3 md:gap-5">
          <div
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xl shadow-md shadow-emerald-600/30 transition-all">
              B
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none group-hover:text-emerald-600 transition-colors">
                BOZOR<span className="text-emerald-600">.UZ</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-wider uppercase">
                Marketplace
              </span>
            </div>
          </div>

          {/* Catalog Button */}
          <button
            onClick={onOpenCategories}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-sm transition-all border border-emerald-200/60"
          >
            <Menu className="w-4 h-4" />
            <span>Kategoriyalar</span>
          </button>
        </div>

        {/* Center: Search Bar with Suggestions */}
        <div ref={searchRef} className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
              placeholder="Mahsulotlarni qidiring (masalan: iPhone, noutbuk, krossovka)..."
              className="w-full pl-11 pr-24 py-2.5 bg-gray-100/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-emerald-500 rounded-xl text-sm focus:outline-hidden transition-all shadow-inner text-gray-900 placeholder:text-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSuggestions([]);
                }}
                className="absolute right-20 text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="submit"
              className="absolute right-1 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
            >
              Qidirish
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-50 animate-in fade-in duration-150">
              <div className="px-3 py-2 bg-gray-50 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Mos kelgan mahsulotlar
              </div>
              {suggestions.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleSelectSuggestion(p)}
                  className="p-3 flex items-center gap-3 hover:bg-emerald-50/50 cursor-pointer transition-colors"
                >
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="w-10 h-10 object-contain rounded-lg bg-gray-50 border border-gray-100 p-1 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs font-bold text-emerald-600">{formatPrice(p.price)}</p>
                  </div>
                </div>
              ))}
              <div
                onClick={() => handleSearchSubmit()}
                className="p-2.5 text-center text-xs font-semibold text-emerald-600 hover:bg-emerald-50 cursor-pointer transition-colors"
              >
                Barcha natijalarni ko‘rish &rarr;
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Login, Favorites, Cart, Notifications, User */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Demo Button for easy test switching */}
          <button
            onClick={onOpenQuickLogin}
            className="hidden xl:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-200 transition-colors"
            title="Rollarni almashtirish"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Rollar</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2.5 text-gray-600 hover:text-emerald-600 hover:bg-gray-100 rounded-xl relative transition-colors"
              aria-label="Bildirishnomalar"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          {/* Favorites */}
          <button
            onClick={() => onNavigate('/favorites')}
            className={`p-2.5 hover:bg-gray-100 rounded-xl relative transition-colors ${
              currentPath === '/favorites' ? 'text-rose-600 bg-rose-50' : 'text-gray-600 hover:text-rose-600'
            }`}
            aria-label="Sevimlilar"
          >
            <Heart className={`w-5 h-5 ${favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Cart */}
          <button
            onClick={() => onNavigate('/cart')}
            className={`flex items-center gap-2 p-2.5 sm:px-3 sm:py-2 rounded-xl transition-all ${
              currentPath === '/cart'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/50'
            }`}
            aria-label="Savat"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.itemsCount > 0 && (
                <span
                  className={`absolute -top-1.5 -right-2 w-4 h-4 text-[10px] font-extrabold rounded-full flex items-center justify-center ${
                    currentPath === '/cart' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {cart.itemsCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-bold">
              {formatPrice(cart.subtotal)}
            </span>
          </button>

          {/* User Auth Dropdown */}
          <div className="relative">
            {isAuthenticated && user ? (
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-gray-800 truncate max-w-[100px] leading-tight">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 leading-tight">
                    {role === 'ADMIN' ? 'Admin' : role === 'SELLER' ? 'Sotuvchi' : 'Xaridor'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3 py-2 text-xs font-bold text-gray-700 hover:text-emerald-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Kirish
                </button>
                <button
                  onClick={() => onNavigate('/register')}
                  className="hidden sm:inline px-3.5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Ro‘yxatdan o‘tish
                </button>
              </div>
            )}

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div onClick={() => setIsUserMenuOpen(false)} className="fixed inset-0 z-40" />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-700">
                      Rol: {role}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigate('/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition-colors text-left"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Mening profilim</span>
                  </button>

                  {role === 'SELLER' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('/seller/dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors text-left"
                    >
                      <Store className="w-4 h-4" />
                      <span>Sotuvchi paneli</span>
                    </button>
                  )}

                  {role === 'ADMIN' && (
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onNavigate('/admin');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-xl transition-colors text-left"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin boshqaruv paneli</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenQuickLogin();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 rounded-xl transition-colors text-left"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Boshqa rolga o‘tish</span>
                  </button>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Tizimdan chiqish</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
