import React from 'react';
import { ShieldCheck, Truck, Headphones, RotateCcw } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-24 md:pb-12 border-t border-gray-800">
      {/* Guarantees row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 border-b border-gray-800 grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Tezkor yetkazish</h4>
            <p className="text-xs text-gray-400 mt-0.5">O‘zbekiston bo‘ylab 24-48 soatda</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">100% Xavfsiz xarid</h4>
            <p className="text-xs text-gray-400 mt-0.5">Faqat original mahsulotlar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Qaytarish kafolati</h4>
            <p className="text-xs text-gray-400 mt-0.5">14 kun ichida oson qaytarish</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-emerald-400 shrink-0">
            <Headphones className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">24/7 Qo‘llab-quvvatlash</h4>
            <p className="text-xs text-gray-400 mt-0.5">+998 71 200-00-00</p>
          </div>
        </div>
      </div>

      {/* Main footer navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-extrabold text-lg">
              B
            </div>
            <span className="text-xl font-extrabold text-white">
              BOZOR<span className="text-emerald-500">.UZ</span>
            </span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            O‘zbekistonning zamonaviy va ishonchli onlayn marketplace platformasi. Sotuvchilar va xaridorlarni birlashtiruvchi qulay raqamli bozor.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-gray-400 font-medium">To‘lov tizimlari:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-emerald-400 border border-gray-700">CLICK</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-cyan-400 border border-gray-700">PAYME</span>
              <span className="px-2 py-0.5 rounded bg-gray-800 text-[10px] font-bold text-purple-400 border border-gray-700">UZUM</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Ommabop kategoriyalar</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => onNavigate('/search?category=telefonlar')} className="hover:text-emerald-400 transition-colors">Telefonlar va Gadjetlar</button></li>
            <li><button onClick={() => onNavigate('/search?category=kompyuterlar')} className="hover:text-emerald-400 transition-colors">Kompyuterlar va Noutbuklar</button></li>
            <li><button onClick={() => onNavigate('/search?category=elektronika')} className="hover:text-emerald-400 transition-colors">Elektronika va Audio</button></li>
            <li><button onClick={() => onNavigate('/search?category=kiyim-kechak')} className="hover:text-emerald-400 transition-colors">Kiyim-kechak</button></li>
            <li><button onClick={() => onNavigate('/search?category=poyabzal')} className="hover:text-emerald-400 transition-colors">Oyoq kiyim</button></li>
          </ul>
        </div>

        {/* For Sellers and Partners */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Hamkorlik</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li><button onClick={() => onNavigate('/seller/register')} className="hover:text-emerald-400 transition-colors">Sotuvchi bo‘lish (Do‘kon ochish)</button></li>
            <li><button onClick={() => onNavigate('/seller/dashboard')} className="hover:text-emerald-400 transition-colors">Sotuvchi shaxsiy kabineti</button></li>
            <li><button onClick={() => onNavigate('/admin')} className="hover:text-purple-400 transition-colors">Admin boshqaruv paneli</button></li>
            <li><span className="text-gray-500">Yetkazib berish qoidalari</span></li>
            <li><span className="text-gray-500">Ommaviy oferta va maxfiylik</span></li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bog‘lanish</h4>
          <p className="text-xs text-gray-400">Toshkent shahri, Yunusobod tumani, Amir Temur shoh ko‘chasi, 107A-uy</p>
          <p className="text-xs text-emerald-400 font-bold">+998 71 200-00-00</p>
          <p className="text-xs text-gray-400">info@bozor.uz</p>
          <p className="text-[11px] text-gray-500 pt-2">Dushanba - Yakshanba: 09:00 - 21:00</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} BOZOR.UZ Marketplace. Barcha huquqlar himoyalangan.</p>
        <p className="text-[11px] text-gray-500">O‘zbekiston Respublikasi hududida elektron tijorat qoidalari asosida faoliyat yuritadi.</p>
      </div>
    </footer>
  );
};
