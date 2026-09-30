import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton.tsx';
import {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Footprints,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  Car,
  BookOpen,
  Box,
  Search,
  ArrowRight,
  Clock,
  Flame,
  TrendingUp,
  ShieldCheck,
  Truck,
  Award,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onOpenCategories: () => void;
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Smartphone,
  Laptop,
  Headphones,
  Shirt,
  Footprints,
  Home,
  Sparkles,
  Dumbbell,
  Baby,
  Car,
  BookOpen,
  Box,
};

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onOpenCategories }) => {
  const [heroSearch, setHeroSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setIsLoading(true);
        const [catsRes, flashRes, popRes, recRes] = await Promise.all([
          api.categories.getAll(),
          api.products.getAll({ flashSale: 'true', limit: 8 }),
          api.products.getAll({ sort: 'popular', limit: 8 }),
          api.products.getAll({ featured: 'true', limit: 8 }),
        ]);

        if (catsRes.data?.success) setCategories(catsRes.data.data);
        if (flashRes.data?.success) setFlashSaleProducts(flashRes.data.data.products);
        if (popRes.data?.success) setPopularProducts(popRes.data.data.products);
        if (recRes.data?.success) setRecommendedProducts(recRes.data.data.products);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onNavigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-radial from-emerald-950 via-gray-900 to-gray-950 text-white py-12 md:py-20 px-4 sm:px-6">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>O‘zbekistonning eng yirik onlayn bozori</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Kerakli mahsulotni <span className="text-emerald-400">oson toping</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Telefonlar, maishiy texnika, kiyim-kechak va minglab boshqa tovarlar rasmiy kafolat va arzon narxlarda.
          </p>

          {/* Big Search Bar */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-2xl mx-auto flex items-center bg-white rounded-2xl p-1.5 shadow-2xl shadow-emerald-950/50 border border-gray-100/20 text-gray-900"
          >
            <div className="pl-3.5 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={heroSearch}
              onChange={e => setHeroSearch(e.target.value)}
              placeholder="Mahsulot qidiring (masalan: iPhone 15, AirPods, Xudi)..."
              className="flex-1 px-3 py-3 text-sm focus:outline-hidden text-gray-900 placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 shrink-0"
            >
              Mahsulotlarni ko‘rish
            </button>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-400 pt-2">
            <span>Ommabop qidiruvlar:</span>
            {['iPhone 15 Pro', 'AirPods Pro 2', 'MacBook M3', 'Nike Air Force', 'Dyson V15'].map(tag => (
              <button
                key={tag}
                onClick={() => onNavigate(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Kategoriyalar</h2>
            <p className="text-xs text-gray-500 mt-0.5">Barcha sohalar bo‘yicha kerakli tovarlar</p>
          </div>
          <button
            onClick={onOpenCategories}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>Barchasi ({categories.length})</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {categories.slice(0, 12).map(cat => {
            const IconComponent = (cat.icon && iconMap[cat.icon]) || Box;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/search?category=${cat.slug}`)}
                className="group p-4 bg-white rounded-2xl border border-gray-100 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-950/5 transition-all cursor-pointer flex flex-col items-center text-center space-y-2.5"
              >
                <div className="w-12 h-12 rounded-2xl bg-gray-50 group-hover:bg-emerald-50 text-gray-700 group-hover:text-emerald-600 flex items-center justify-center transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  {cat.productsCount !== undefined && (
                    <span className="text-[11px] text-gray-400">
                      {cat.productsCount} ta tovar
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Flash Sale / Chegirmalar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-200/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <span>Flash Sale — Chegirmalar</span>
                </h2>
                <p className="text-xs text-gray-500">Maxsus takliflar cheklangan vaqt davomida amal qiladi</p>
              </div>
            </div>

            {/* Live Timer */}
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 bg-white px-3.5 py-2 rounded-xl shadow-xs border border-gray-100">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>Tugashiga qoldi:</span>
              <div className="flex items-center gap-1 font-mono text-amber-600">
                <span className="px-1.5 py-0.5 bg-amber-50 rounded-md">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                :
                <span className="px-1.5 py-0.5 bg-amber-50 rounded-md">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                :
                <span className="px-1.5 py-0.5 bg-amber-50 rounded-md">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : flashSaleProducts.slice(0, 4).map(prod => (
                  <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
                ))}
          </div>
        </div>
      </section>

      {/* 4. Popular Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Eng ommabop mahsulotlar
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Xaridorlar tomonidan eng ko‘p buyurtma qilingan tovarlar</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/search?sort=popular')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>Barchasini ko‘rish</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : popularProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
              ))}
        </div>
      </section>

      {/* 5. Seller Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="rounded-3xl bg-linear-to-r from-emerald-800 to-teal-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl text-center md:text-left z-10">
            <span className="px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold uppercase tracking-wider">
              Sotuvchilar uchun imkoniyat
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              BOZOR.UZ da o‘z do‘koningizni oching!
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              Mahsulotlaringizni O‘zbekiston bo‘ylab millionlab xaridorlarga soting. Qulay admin panel, statistika va tezkor to‘lovlar.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => onNavigate('/seller/register')}
                className="px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all active:scale-95"
              >
                Sotuvchi sifatida ro‘yxatdan o‘tish
              </button>
              <button
                onClick={() => onNavigate('/seller/dashboard')}
                className="px-5 py-3 bg-emerald-700/60 hover:bg-emerald-700 text-white border border-emerald-500/50 rounded-xl text-xs sm:text-sm font-semibold transition-all"
              >
                Sotuvchi kabineti
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 z-10 text-center">
            <div className="p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
              <span className="text-2xl font-extrabold text-white block">0%</span>
              <span className="text-[11px] text-emerald-200">Dastlabki oy komissiyasi</span>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-xs rounded-2xl border border-white/10">
              <span className="text-2xl font-extrabold text-white block">24/7</span>
              <span className="text-[11px] text-emerald-200">Logistika va yetkazish</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Recommended Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Siz uchun tavsiyalar
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Eng yuqori baholangan sifatli mahsulotlar</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('/search')}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>Barchasi</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : recommendedProducts.map(prod => (
                <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
              ))}
        </div>
      </section>
    </div>
  );
};
