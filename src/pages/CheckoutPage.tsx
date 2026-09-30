import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import { api } from '../services/api.ts';
import { formatPrice } from '../utils/formatters.ts';
import {
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Building,
  ArrowRight,
  Loader2,
  Package,
} from 'lucide-react';

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

const REGIONS_OF_UZBEKISTAN = [
  'Toshkent shahri',
  'Toshkent viloyati',
  'Samarqand viloyati',
  'Buxoro viloyati',
  'Farg‘ona viloyati',
  'Andijon viloyati',
  'Namangan viloyati',
  'Qashqadaryo viloyati',
  'Surxondaryo viloyati',
  'Xorazm viloyati',
  'Navoiy viloyati',
  'Jizzax viloyati',
  'Sirdaryo viloyati',
  'Qoraqalpog‘iston Respublikasi',
];

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useNotification();

  // Form fields
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name.split(' ')[1] || '');
  const [phone, setPhone] = useState(user?.phone || '+998');
  const [region, setRegion] = useState(REGIONS_OF_UZBEKISTAN[0]);
  const [city, setCity] = useState('Yunusobod tumani');
  const [addressLine, setAddressLine] = useState('');
  const [notes, setNotes] = useState('');

  // Options
  const [deliveryMethod, setDeliveryMethod] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CLICK' | 'PAYME' | 'UZUM'>('CLICK');

  // Submit states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  if (cart.items.length === 0 && !createdOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Savatda mahsulot yo‘q</h2>
        <p className="text-xs text-gray-500">Buyurtma berish uchun avval savatingizga mahsulot qo‘shing.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Xarid qilish
        </button>
      </div>
    );
  }

  // Success view
  if (createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Buyurtma muvaffaqiyatli qabul qilindi
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Xaridingiz uchun tashakkur!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Buyurtmangiz raqami: <strong className="text-gray-900 font-mono text-base">{createdOrder.orderNumber}</strong>.
            Kuryerlik xizmati operatori tez orada siz bilan bog‘lanadi.
          </p>
        </div>

        {/* Order Card Preview */}
        <div className="p-6 bg-white rounded-3xl border border-gray-100 text-left space-y-4 shadow-sm text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <p className="text-gray-400">Yetkazish manzili:</p>
              <p className="font-bold text-gray-900 mt-0.5">
                {createdOrder.shippingAddress?.region}, {createdOrder.shippingAddress?.city}, {createdOrder.shippingAddress?.addressLine}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400">To‘lov holati:</p>
              <span className={`inline-block mt-0.5 font-bold px-2 py-0.5 rounded-md ${
                createdOrder.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {createdOrder.paymentStatus === 'PAID' ? 'To‘langan' : 'Yetkazilganda to‘lanadi'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-gray-400 font-medium">Buyurtma tarkibi ({createdOrder.items?.length || 0} ta):</p>
            {createdOrder.items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between py-1">
                <span className="truncate max-w-xs text-gray-800">{item.name} × {item.quantity}</span>
                <span className="font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-sm font-extrabold text-gray-900">
            <span>Jami summa:</span>
            <span className="text-emerald-600">{formatPrice(createdOrder.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onNavigate(`/order/${createdOrder.id}`)}
            className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span>Buyurtmani kuzatish</span>
          </button>
          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all"
          >
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      showToast('Buyurtma berish uchun avval tizimga kiring', 'info');
      onNavigate('/login');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      showToast('Iltimos, ism va familiyangizni to‘liq kiriting', 'error');
      return;
    }

    if (!phone.trim() || phone.length < 9) {
      showToast('Iltimos, to‘g‘ri telefon raqamini kiriting', 'error');
      return;
    }

    if (!addressLine.trim()) {
      showToast('Iltimos, aniq ko‘cha va xonadon manzilini kiriting', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        shippingAddress: {
          fullName: `${firstName.trim()} ${lastName.trim()}`,
          phone: phone.trim(),
          region,
          city,
          addressLine: addressLine.trim(),
          notes: notes.trim() || undefined,
        },
        items: cart.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        paymentMethod,
        deliveryMethod,
        notes: notes.trim() || undefined,
      };

      const res = await api.orders.create(payload);
      if (res.data?.success) {
        showToast('Buyurtmangiz muvaffaqiyatli rasmiylashtirildi!', 'success');
        setCreatedOrder(res.data.data);
        clearCart();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Buyurtma rasmiylashtirishda xatolik yuz berdi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Buyurtmani rasmiylashtirish</h1>
        <p className="text-xs text-gray-500 mt-0.5">Yetkazib berish va to‘lov ma’lumotlarini to‘ldiring</p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Qabul qiluvchi */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-sm text-gray-900">Qabul qiluvchi ma’lumotlari</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Ism *</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ismingiz"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Familiya *</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Familiyangiz"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Telefon raqam *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Manzil */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-sm text-gray-900">Yetkazib berish manzili</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Viloyat / Shahar *</label>
                <select
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900 font-medium"
                >
                  {REGIONS_OF_UZBEKISTAN.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Tuman / Shahar *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Masalan: Yunusobod tumani"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Aniq manzil (ko‘cha, uy, xonadon) *</label>
                <input
                  type="text"
                  required
                  value={addressLine}
                  onChange={e => setAddressLine(e.target.value)}
                  placeholder="Masalan: Amir Temur ko‘chasi, 107A-uy, 45-xonadon"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Kuryerga izoh (ixtiyoriy)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Masalan: Domofon kodi 45K, yetkazishdan oldin telefon qiling"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Yetkazish & To'lov usuli */}
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="font-bold text-sm text-gray-900">Yetkazish va to‘lov usullari</h2>
            </div>

            {/* Delivery method choice */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700">Yetkazib berish usuli:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('DELIVERY')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    deliveryMethod === 'DELIVERY'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Kuryer orqali yetkazish</p>
                    <p className="text-[10px] text-gray-500">Eshigingizgacha yetkazib beriladi</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMethod('PICKUP')}
                  className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    deliveryMethod === 'PICKUP'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Building className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Olib ketish punkti</p>
                    <p className="text-[10px] text-gray-500">Eng yaqin Bozor.uz punktidan</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Payment method choice */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-700">To‘lov turi:</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'CLICK', label: 'Click', desc: 'Online to‘lov', color: 'text-emerald-600' },
                  { id: 'PAYME', label: 'Payme', desc: 'Online to‘lov', color: 'text-cyan-600' },
                  { id: 'UZUM', label: 'Uzum Bank', desc: 'Ilova orqali', color: 'text-purple-600' },
                  { id: 'CASH', label: 'Naqd pul', desc: 'Qabul qilganda', color: 'text-gray-800' },
                ].map(pm => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      paymentMethod === pm.id
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className={`text-xs font-black block ${pm.color}`}>{pm.label}</span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">{pm.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Summary & Order confirmation (4 cols) */}
        <div className="lg:col-span-4 space-y-4 sticky top-24">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-gray-900">Buyurtma tarkibi</h2>

            <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 pr-1">
              {cart.items.map(item => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <img
                      src={item.product?.images[0]}
                      alt=""
                      className="w-8 h-8 rounded-lg object-contain bg-gray-50 p-1 shrink-0"
                    />
                    <div className="truncate">
                      <p className="font-semibold text-gray-900 truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-gray-400">{item.quantity} dona</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Oraliq jami:</span>
                <span className="font-bold text-gray-900">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Yetkazib berish:</span>
                <span className="font-bold text-emerald-600">
                  {deliveryMethod === 'PICKUP' || cart.deliveryFee === 0 ? 'Bepul' : formatPrice(cart.deliveryFee)}
                </span>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-base font-extrabold text-gray-900">
                <span>Jami to‘lov:</span>
                <span className="text-emerald-600">
                  {formatPrice(deliveryMethod === 'PICKUP' ? cart.subtotal : cart.total)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Buyurtmani tasdiqlash</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ma’lumotlaringiz shifrlangan va xavfsiz saqlanadi</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
