import React from 'react';
import { Product } from '../types/index.ts';
import { useCart } from '../context/CartContext.tsx';
import { useFavorites } from '../context/FavoritesContext.tsx';
import { formatPrice } from '../utils/formatters.ts';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onNavigate: (path: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, cart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const isFav = isFavorite(product.id);
  const cartItem = cart.items.find(i => i.productId === product.id);
  const inCartCount = cartItem?.quantity || 0;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div
      onClick={() => onNavigate(`/product/${product.slug || product.id}`)}
      className="group relative bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer h-full"
    >
      {/* Top badges & favorite button */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50 flex items-center justify-center p-3">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.discount && product.discount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-lg shadow-xs">
              -{product.discount}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500 text-white rounded-lg shadow-xs flex items-center gap-1">
              🔥 Sale
            </span>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full transition-all duration-200 z-10 ${
            isFav
              ? 'bg-rose-50 text-rose-500 scale-105'
              : 'bg-white/80 backdrop-blur-xs text-gray-400 hover:text-rose-500 hover:bg-white shadow-xs'
          }`}
          aria-label="Sevimlilarga qo'shish"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500 stroke-rose-500' : ''}`} />
        </button>

        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              Mahsulot tugagan
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
            <span>{product.brand || product.categoryName || 'Bozor.uz'}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
              <span className="font-semibold text-gray-700">{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-600 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Price & Add to Cart action */}
        <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`p-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : inCartCount > 0
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs shadow-emerald-700/20'
            }`}
            title="Savatga qo'shish"
          >
            {inCartCount > 0 ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                <span className="text-xs font-bold text-emerald-700">{inCartCount} ta</span>
              </>
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
