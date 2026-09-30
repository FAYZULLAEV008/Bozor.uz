import React from 'react';
import { useCart } from '../context/CartContext.tsx';
import { formatPrice } from '../utils/formatters.ts';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from 'lucide-react';

interface CartPageProps {
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, isLoading } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Savatingiz hozircha bo‘sh</h2>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Bosh sahifaga o‘tib o‘zingizga yoqqan mahsulotlarni tanlang va savatga qo‘shing.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 inline-flex items-center gap-2"
        >
          <span>Xaridni boshlash</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Title & Clear action */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Savat</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Jami {cart.itemsCount} ta mahsulot tanlangan
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 p-2 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Savatni tozalash</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cart items list (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map(item => {
            const product = item.product;
            if (!product) return null;

            return (
              <div
                key={item.id || item.productId}
                className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-between"
              >
                {/* Product thumbnail & title */}
                <div
                  onClick={() => onNavigate(`/product/${product.slug || product.id}`)}
                  className="flex items-center gap-4 cursor-pointer w-full sm:w-auto"
                >
                  <img
                    src={product.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=200'}
                    alt={product.name}
                    className="w-18 h-18 sm:w-20 sm:h-20 object-contain rounded-xl bg-gray-50 p-2 shrink-0 border border-gray-100 mix-blend-multiply"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      {product.brand || product.categoryName || 'Bozor.uz'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 hover:text-emerald-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quantity & subtotal & delete */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  {/* Quantity Counter */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-white p-1">
                    <button
                      onClick={() => updateQuantity(item.id, product.id, item.quantity - 1)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      aria-label="Kamaytirish"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-bold text-xs text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, product.id, item.quantity + 1)}
                      disabled={item.quantity >= product.stock}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-40 transition-colors"
                      aria-label="Ko'paytirish"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line total */}
                  <div className="text-right min-w-[100px]">
                    <span className="text-sm font-extrabold text-gray-900 block">
                      {formatPrice(product.price * item.quantity)}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeFromCart(item.id, product.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">Buyurtma xulosasi</h2>

            <div className="space-y-3 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Mahsulotlar soni:</span>
                <span className="font-bold text-gray-900">{cart.itemsCount} ta</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Oraliq jami:</span>
                <span className="font-bold text-gray-900">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Yetkazib berish:</span>
                <span className="font-bold text-emerald-600">
                  {cart.deliveryFee === 0 ? 'Bepul' : formatPrice(cart.deliveryFee)}
                </span>
              </div>

              {cart.subtotal < 200000 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  Bepul yetkazib berish uchun yana{' '}
                  <strong>{formatPrice(200000 - cart.subtotal)}</strong> lik mahsulot qo‘shing.
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-gray-900">
                <span>Jami to‘lov:</span>
                <span className="text-emerald-600">{formatPrice(cart.total)}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('/checkout')}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Rasmiylashtirishga o‘tish</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-gray-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Xavfsiz to‘lov
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Tezkor yetkazish
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
