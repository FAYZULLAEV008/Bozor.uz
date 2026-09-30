import React, { useState, useEffect } from 'react';
import { Product, Review } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useCart } from '../context/CartContext.tsx';
import { useFavorites } from '../context/FavoritesContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { formatPrice, formatShortDate } from '../utils/formatters.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import {
  Heart,
  ShoppingBag,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  Store,
  MessageSquare,
  ChevronRight,
  Share2,
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (path: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId, onNavigate }) => {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useNotification();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Review form state
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const res = await api.products.getById(productId);
        if (res.data?.success) {
          setProduct(res.data.data);
          setSelectedImage(res.data.data.images[0] || '');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Mahsulotni yuklashda xatolik', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [productId]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500 font-medium">Mahsulot yuklanmoqda...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Mahsulot topilmadi</h2>
        <p className="text-sm text-gray-500">Ushbu mahsulot sotuvdan olingan yoki mavjud emas.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  const isFav = isFavorite(product.id);

  const handleAddToCart = async () => {
    try {
      setIsAdding(true);
      await addToCart(product, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    onNavigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Sharh qoldirish uchun avval tizimga kiring', 'info');
      onNavigate('/login');
      return;
    }

    if (!reviewComment.trim()) {
      showToast('Iltimos, sharhingiz matnini kiriting', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await api.reviews.create(product.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });

      if (res.data?.success) {
        showToast('Sharhingiz muvaffaqiyatli saqlandi! Rahmat.', 'success');
        setProduct(prev => prev ? {
          ...prev,
          reviews: [res.data.data, ...(prev.reviews || [])],
          reviewCount: (prev.reviewCount || 0) + 1,
        } : prev);
        setReviewComment('');
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Sharh yuborishda xatolik', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <button onClick={() => onNavigate('/')} className="hover:text-emerald-600 transition-colors">
          Bosh sahifa
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button
          onClick={() => onNavigate(`/search?category=${product.category?.slug || ''}`)}
          className="hover:text-emerald-600 transition-colors"
        >
          {product.category?.name || 'Kategoriya'}
        </button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-700 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main product showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Images gallery (5 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-3xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center p-6 shadow-xs">
            <img
              src={selectedImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-contain mix-blend-multiply"
            />
            {product.discount && product.discount > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 text-xs font-bold bg-rose-500 text-white rounded-xl shadow-xs">
                -{product.discount}%
              </span>
            )}
            <button
              onClick={() => toggleFavorite(product)}
              className={`absolute top-4 right-4 p-3 rounded-full transition-all duration-200 ${
                isFav
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-gray-100 text-gray-400 hover:text-rose-500 hover:bg-white shadow-xs'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500 stroke-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-18 h-18 rounded-2xl bg-white border p-1.5 overflow-hidden transition-all shrink-0 ${
                    selectedImage === img
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={img} alt="kichik rasm" className="w-full h-full object-contain mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product details & actions (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-1.5">
              <span>{product.brand || 'Bozor.uz Kafolati'}</span>
              <span>•</span>
              <span className="text-gray-400">SKU: {product.sku}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>

            {/* Rating & Reviews count */}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5 text-amber-500">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-gray-100 text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-gray-900 text-sm">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <a href="#reviews" className="text-emerald-600 hover:underline font-semibold">
                {product.reviewCount} ta sharh
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">
                {product.stock > 0 ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Omborda mavjud ({product.stock} ta)
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">Mahsulot tugagan</span>
                )}
              </span>
            </div>
          </div>

          {/* Price box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-base text-gray-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
            {product.discount && (
              <p className="text-xs text-emerald-700 font-medium">
                Siz ushbu xariddan {formatPrice(product.oldPrice! - product.price)} tejaysiz
              </p>
            )}
          </div>

          {/* Quantity selector & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-700">Miqdori:</span>
              <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || product.stock <= 0}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 font-bold text-sm text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-xs text-gray-400">Jami: {formatPrice(product.price * quantity)}</span>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0 || isAdding}
                className={`py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                  product.stock <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-700/20'
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                <span>Savatga qo‘shish</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3.5 px-6 rounded-xl font-bold text-sm bg-gray-900 text-white hover:bg-black transition-all active:scale-95 shadow-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Hozir xarid qilish
              </button>
            </div>
          </div>

          {/* Delivery & Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900">Tezkor yetkazish</p>
                <p className="text-[11px] text-gray-500">Toshkent: 24 soat</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900">Kafolat</p>
                <p className="text-[11px] text-gray-500">1 yil rasmiy</p>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900">Qaytarish</p>
                <p className="text-[11px] text-gray-500">14 kun ichida</p>
              </div>
            </div>
          </div>

          {/* Seller Card */}
          {product.seller && (
            <div className="p-4 rounded-2xl border border-gray-200 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-base">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{product.seller.storeName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded-md font-semibold">
                      Tasdiqlangan
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                      ★ {product.seller.rating || 5.0}
                    </span>
                    <span>•</span>
                    <span>{product.seller.totalSales || 0}+ sotuvlar</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onNavigate(`/search?sellerId=${product.seller?.id}`)}
                className="px-3.5 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              >
                Do‘konga o‘tish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Specifications & Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 border-t border-gray-100">
        <div className="lg:col-span-7 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Mahsulot tavsifi</h2>
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>

          {/* Specifications Table */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-base font-bold text-gray-900">Texnik xususiyatlari</h3>
              <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100 text-xs">
                {Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 p-3.5 hover:bg-gray-50/50">
                    <span className="text-gray-500 font-medium">{key}</span>
                    <span className="text-gray-900 font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              <span>Mijozlar sharhlari ({product.reviews?.length || 0})</span>
            </h2>
          </div>

          {/* Add Review Form */}
          <form onSubmit={handleSubmitReview} className="p-4 bg-gray-50 rounded-2xl space-y-3 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-800">O‘z fikringizni bildiring</h4>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Bahoyingiz:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              placeholder="Mahsulot haqidagi taassurotlaringiz bilan bo‘lishing..."
              className="w-full p-3 bg-white rounded-xl border border-gray-200 text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900 placeholder:text-gray-400"
            />

            <button
              type="submit"
              disabled={isSubmittingReview}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              {isSubmittingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>Sharhni yuborish</span>
            </button>
          </form>

          {/* Reviews list */}
          <div className="space-y-3">
            {(!product.reviews || product.reviews.length === 0) ? (
              <p className="text-xs text-gray-400 text-center py-6">
                Bu mahsulotga hali sharhlar yozilmagan. Birinchi bo‘lib sharh qoldiring!
              </p>
            ) : (
              product.reviews.map(rev => (
                <div key={rev.id} className="p-4 rounded-2xl bg-white border border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {rev.userName.charAt(0)}
                      </div>
                      <span className="text-xs font-bold text-gray-900">{rev.userName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                      <span>★</span>
                      <span>{rev.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                  <span className="text-[10px] text-gray-400 block">{formatShortDate(rev.createdAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-100 space-y-6">
          <h2 className="text-xl font-bold text-gray-900">O‘xshash mahsulotlar</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
