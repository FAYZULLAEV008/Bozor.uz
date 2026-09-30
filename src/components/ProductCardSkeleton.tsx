import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs animate-pulse flex flex-col h-full">
      <div className="aspect-square bg-gray-200 w-full relative" />
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded-sm w-1/3" />
          <div className="h-4 bg-gray-200 rounded-sm w-full" />
          <div className="h-4 bg-gray-200 rounded-sm w-4/5" />
        </div>
        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <div className="space-y-1.5 w-1/2">
            <div className="h-5 bg-gray-200 rounded-sm w-full" />
            <div className="h-3 bg-gray-200 rounded-sm w-2/3" />
          </div>
          <div className="h-9 w-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
