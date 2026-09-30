import React, { useState, useEffect } from 'react';
import { Order } from '../types/index.ts';
import { api } from '../services/api.ts';
import { formatPrice, formatDate } from '../utils/formatters.ts';
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  XCircle,
  MapPin,
  CreditCard,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

interface OrderTrackingPageProps {
  orderId: string;
  onNavigate: (path: string) => void;
}

const ORDER_STEPS = [
  { id: 'PENDING', label: 'Qabul qilindi', icon: Clock },
  { id: 'CONFIRMED', label: 'Tasdiqlandi', icon: CheckCircle2 },
  { id: 'PROCESSING', label: 'Yig‘ilmoqda', icon: Package },
  { id: 'SHIPPED', label: 'Yo‘lda', icon: Truck },
  { id: 'DELIVERED', label: 'Yetkazildi', icon: CheckCircle2 },
];

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ orderId, onNavigate }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await api.orders.getById(orderId);
        if (res.data?.success) {
          setOrder(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-gray-500">Buyurtma ma’lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Package className="w-12 h-12 mx-auto text-gray-400 stroke-1" />
        <h2 className="text-xl font-bold text-gray-900">Buyurtma topilmadi</h2>
        <p className="text-xs text-gray-500">Buyurtma ID si noto‘g‘ri yoki ko‘rish huquqingiz yo‘q.</p>
        <button
          onClick={() => onNavigate('/profile')}
          className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          Buyurtmalarimga qaytish
        </button>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex(s => s.id === order.status);
  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top back button & order header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <button
          onClick={() => onNavigate('/profile')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Buyurtmalar ro‘yxatiga qaytish</span>
        </button>

        <div className="text-right">
          <span className="font-mono text-base font-extrabold text-gray-900 block">
            {order.orderNumber}
          </span>
          <span className="text-[11px] text-gray-400">
            Rasmiylashtirilgan: {formatDate(order.createdAt)}
          </span>
        </div>
      </div>

      {/* Progress Timeline Tracker */}
      <div className="p-6 sm:p-8 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-6">
        <h2 className="text-base font-bold text-gray-900">Buyurtma holati</h2>

        {isCancelled ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700">
            <XCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold text-sm">Buyurtma bekor qilingan</p>
              <p className="text-xs text-rose-600 mt-0.5">Ushbu buyurtma ma’muriyat yoki xaridor tomonidan bekor qilindi.</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            {/* Step progress line */}
            <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 z-0" />
            <div
              className="hidden sm:block absolute top-1/2 left-0 h-1 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
              style={{
                width: `${(Math.max(0, currentStepIndex) / (ORDER_STEPS.length - 1)) * 100}%`,
              }}
            />

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-5 gap-4">
              {ORDER_STEPS.map((step, idx) => {
                const StepIcon = step.icon;
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.id} className="flex sm:flex-col items-center gap-3 text-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                        isCurrent
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-md shadow-emerald-600/30'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <span className="text-[10px] text-emerald-600 font-semibold block">Hozirgi bosqich</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Order items & details breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 pb-3 border-b border-gray-100">
            Mahsulotlar ro‘yxati ({order.items?.length || 0} ta)
          </h3>

          <div className="divide-y divide-gray-50">
            {order.items?.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=100'}
                    alt=""
                    className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {item.quantity} dona × {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-900 shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Oraliq jami:</span>
              <span className="font-bold text-gray-900">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Yetkazib berish xizmati:</span>
              <span className="font-bold text-emerald-600">
                {order.deliveryFee === 0 ? 'Bepul' : formatPrice(order.deliveryFee)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
              <span>Jami summa:</span>
              <span className="text-emerald-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping and Payment Info (1 col) */}
        <div className="space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Yetkazish manzili</span>
            </h3>
            <div className="space-y-1 text-gray-600">
              <p className="font-bold text-gray-900">{order.shippingAddress?.fullName}</p>
              <p className="font-mono">{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.region}, {order.shippingAddress?.city}</p>
              <p className="text-gray-800">{order.shippingAddress?.addressLine}</p>
              {order.shippingAddress?.notes && (
                <p className="text-[11px] text-gray-400 italic pt-1">
                  Izoh: {order.shippingAddress.notes}
                </p>
              )}
            </div>
          </div>

          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3 text-xs">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <span>To‘lov ma’lumotlari</span>
            </h3>
            <div className="space-y-1.5 text-gray-600">
              <div className="flex justify-between">
                <span>To‘lov usuli:</span>
                <span className="font-bold text-gray-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Holati:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {order.paymentStatus === 'PAID' ? 'To‘langan' : 'Kutilmoqda'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
