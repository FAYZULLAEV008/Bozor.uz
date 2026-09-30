import React from 'react';
import { Category } from '../types/index.ts';
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
  X,
  ChevronRight,
} from 'lucide-react';

interface CategoriesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSelectCategory: (slug: string) => void;
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

export const CategoriesDrawer: React.FC<CategoriesDrawerProps> = ({
  isOpen,
  onClose,
  categories,
  onSelectCategory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              B
            </span>
            <h2 className="text-lg font-bold text-gray-900">Barcha kategoriyalar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 divide-y divide-gray-50">
          {categories.map(cat => {
            const IconComponent = (cat.icon && iconMap[cat.icon]) || Box;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-50/60 hover:text-emerald-700 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center text-gray-600 group-hover:text-emerald-700 transition-colors">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 block">
                      {cat.name}
                    </span>
                    {cat.productsCount !== undefined && (
                      <span className="text-xs text-gray-400 font-normal">
                        {cat.productsCount} ta mahsulot
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}
        </div>

        {/* Footer help */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 text-center">
          O‘zbekiston bo‘ylab tezkor kuryerlik yetkazib berish xizmati
        </div>
      </div>
    </div>
  );
};
