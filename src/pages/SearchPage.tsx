import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types/index.ts';
import { api } from '../services/api.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ProductCardSkeleton } from '../components/ProductCardSkeleton.tsx';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Star } from 'lucide-react';

interface SearchPageProps {
  initialQuery?: string;
  initialCategory?: string;
  initialSellerId?: string;
  initialSort?: string;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = '',
  initialCategory = '',
  initialSellerId = '',
  initialSort = 'newest',
  onNavigate,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [rating, setRating] = useState('');
  const [sort, setSort] = useState(initialSort);
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    // Load categories
    api.categories.getAll().then(res => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  const fetchSearchResults = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        q: query.trim() || undefined,
        category: category || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        rating: rating ? Number(rating) : undefined,
        sellerId: initialSellerId || undefined,
        sort,
        page,
        limit: 12,
      };

      const res = await api.products.getAll(params);
      if (res.data?.success) {
        setProducts(res.data.data.products);
        setTotalPages(res.data.data.pagination.totalPages);
        setTotalCount(res.data.data.pagination.total);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [query, category, sort, page, rating]);

  const handleApplyPriceFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchSearchResults();
  };

  const clearAllFilters = () => {
    setQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top search & sorting bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Natijalar ichidan qidirish..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500 text-gray-900"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 pointer-events-none" />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setPage(1);
              }}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <span className="text-xs text-gray-500 font-medium">
            <strong className="text-gray-900">{totalCount} ta</strong> tovar topildi
          </span>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setShowMobileFilter(!showMobileFilter)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-gray-100 rounded-xl text-xs font-semibold text-gray-700"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtr</span>
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            <select
              value={sort}
              onChange={e => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="newest">Eng yangi</option>
              <option value="price_asc">Arzon → qimmat</option>
              <option value="price_desc">Qimmat → arzon</option>
              <option value="popular">Eng mashhur</option>
              <option value="rating">Eng yuqori reyting</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <aside
          className={`space-y-6 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs md:block ${
            showMobileFilter ? 'block fixed inset-x-4 top-20 z-50 shadow-2xl max-h-[85vh] overflow-y-auto' : 'hidden'
          }`}
        >
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <span>Filtrlar</span>
            </h3>
            <button onClick={clearAllFilters} className="text-xs text-emerald-600 hover:underline font-semibold">
              Tozalash
            </button>
          </div>

          {/* Categories Filter */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Kategoriya</h4>
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
              <button
                onClick={() => {
                  setCategory('');
                  setPage(1);
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  !category ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Barchasi
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    setCategory(c.slug);
                    setPage(1);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                    category === c.slug ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.productsCount !== undefined && (
                    <span className="text-[10px] text-gray-400">({c.productsCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <form onSubmit={handleApplyPriceFilter} className="space-y-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Narx oralig‘i (so‘m)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                placeholder="Dan"
                className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                placeholder="Gacha"
                className="w-full p-2 text-xs border border-gray-200 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors"
            >
              Narxni qo‘llash
            </button>
          </form>

          {/* Rating Filter */}
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Reyting</h4>
            <div className="space-y-1">
              {['4', '4.5', '4.8'].map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setRating(rating === r ? '' : r);
                    setPage(1);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    rating === r ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{r} va undan yuqori</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {showMobileFilter && (
            <button
              onClick={() => setShowMobileFilter(false)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Filtrlarni yopish
            </button>
          )}
        </aside>

        {/* Right Product Grid & Pagination */}
        <div className="md:col-span-3 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Mahsulot topilmadi</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Kiritilgan so‘rov yoki parametrlar bo‘yicha hech qanday tovar topilmadi. Qidiruv so‘zini o‘zgartirib ko‘ring.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Filtrlarni tozalash
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map(prod => (
                  <ProductCard key={prod.id} product={prod} onNavigate={onNavigate} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    Oldingi
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded-xl text-xs font-bold transition-colors ${
                          page === i + 1
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                  >
                    Keyingi
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
