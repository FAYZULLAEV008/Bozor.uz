import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useNotification } from './NotificationContext.tsx';

interface FavoritesContextType {
  favorites: Product[];
  favoriteIds: Set<string>;
  isFavorite: (productId: string) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);
const GUEST_FAV_KEY = 'bozor_guest_favorites';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchFavorites = async () => {
    if (!isAuthenticated) {
      try {
        const raw = localStorage.getItem(GUEST_FAV_KEY);
        const parsed: Product[] = raw ? JSON.parse(raw) : [];
        setFavorites(parsed);
        setFavoriteIds(new Set(parsed.map(p => p.id)));
      } catch {
        setFavorites([]);
        setFavoriteIds(new Set());
      }
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.favorites.getAll();
      if (res.data?.success) {
        const prods: Product[] = res.data.data
          .map((item: any) => item.product)
          .filter((p: any) => Boolean(p));
        setFavorites(prods);
        setFavoriteIds(new Set(prods.map(p => p.id)));
      }
    } catch (err) {
      console.warn('Failed to load favorites:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [isAuthenticated]);

  const isFavorite = (productId: string) => {
    return favoriteIds.has(productId);
  };

  const toggleFavorite = async (product: Product) => {
    const isFav = favoriteIds.has(product.id);

    if (isAuthenticated) {
      try {
        if (isFav) {
          await api.favorites.remove(product.id);
          setFavorites(prev => prev.filter(p => p.id !== product.id));
          setFavoriteIds(prev => {
            const next = new Set(prev);
            next.delete(product.id);
            return next;
          });
          showToast('Sevimlilardan olib tashlandi', 'info');
        } else {
          await api.favorites.add(product.id);
          setFavorites(prev => [product, ...prev]);
          setFavoriteIds(prev => new Set(prev).add(product.id));
          showToast('Sevimlilarga qo‘shildi! ❤️');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error');
      }
    } else {
      // Guest
      let nextFavs = [...favorites];
      if (isFav) {
        nextFavs = nextFavs.filter(p => p.id !== product.id);
        showToast('Sevimlilardan olib tashlandi', 'info');
      } else {
        nextFavs.unshift(product);
        showToast('Sevimlilarga qo‘shildi! ❤️');
      }

      setFavorites(nextFavs);
      setFavoriteIds(new Set(nextFavs.map(p => p.id)));
      localStorage.setItem(GUEST_FAV_KEY, JSON.stringify(nextFavs));
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        toggleFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
