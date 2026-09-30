import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useFavorites } from '../context/FavoritesContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Home, Grid, ShoppingBag, Heart, User, Shield, Store } from 'lucide-react';

interface MobileNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenCategories: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPath, onNavigate, onOpenCategories }) => {
  const { cart } = useCart();
  const { favorites } = useFavorites();
  const { isAuthenticated, role } = useAuth();

  const isHome = currentPath === '/';
  const isCart = currentPath === '/cart';
  const isFavorites = currentPath === '/favorites';
  const isProfile = currentPath.startsWith('/profile') || currentPath === '/login';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-3 py-1.5 flex items-center justify-around shadow-lg">
      {/* Home */}
      <button
        onClick={() => onNavigate('/')}
        className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
          isHome ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <Home className={`w-5 h-5 ${isHome ? 'stroke-[2.5]' : ''}`} />
        <span className="text-[10px] mt-0.5">Bosh sahifa</span>
      </button>

      {/* Categories */}
      <button
        onClick={onOpenCategories}
        className="flex flex-col items-center justify-center p-1.5 text-gray-500 hover:text-gray-900 transition-colors"
      >
        <Grid className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">Katalog</span>
      </button>

      {/* Cart with badge */}
      <button
        onClick={() => onNavigate('/cart')}
        className={`flex flex-col items-center justify-center p-1.5 relative transition-colors ${
          isCart ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <div className="relative">
          <ShoppingBag className={`w-5 h-5 ${isCart ? 'stroke-[2.5]' : ''}`} />
          {cart.itemsCount > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {cart.itemsCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Savat</span>
      </button>

      {/* Favorites */}
      <button
        onClick={() => onNavigate('/favorites')}
        className={`flex flex-col items-center justify-center p-1.5 relative transition-colors ${
          isFavorites ? 'text-rose-600 font-bold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        <div className="relative">
          <Heart className={`w-5 h-5 ${isFavorites || favorites.length > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
          {favorites.length > 0 && (
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
              {favorites.length}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5">Sevimlilar</span>
      </button>

      {/* Profile / Roles */}
      <button
        onClick={() => onNavigate(isAuthenticated ? '/profile' : '/login')}
        className={`flex flex-col items-center justify-center p-1.5 transition-colors ${
          isProfile ? 'text-emerald-600 font-bold' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        {role === 'ADMIN' ? (
          <Shield className="w-5 h-5 text-purple-600" />
        ) : role === 'SELLER' ? (
          <Store className="w-5 h-5 text-emerald-600" />
        ) : (
          <User className="w-5 h-5" />
        )}
        <span className="text-[10px] mt-0.5">
          {isAuthenticated ? (role === 'ADMIN' ? 'Admin' : role === 'SELLER' ? 'Sotuvchi' : 'Profil') : 'Kirish'}
        </span>
      </button>
    </nav>
  );
};
