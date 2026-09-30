import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CartSummary, Product } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useAuth } from './AuthContext.tsx';
import { useNotification } from './NotificationContext.tsx';

interface CartContextType {
  cart: CartSummary;
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, productId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string, productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'bozor_guest_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useNotification();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cart, setCart] = useState<CartSummary>({
    items: [],
    itemsCount: 0,
    subtotal: 0,
    deliveryFee: 0,
    total: 0,
  });

  const calculateGuestCart = (items: Array<{ productId: string; quantity: number; product: Product }>): CartSummary => {
    const validItems = items.filter(i => i.product && i.product.stock > 0);
    const subtotal = validItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
    const deliveryFee = subtotal >= 200000 || subtotal === 0 ? 0 : 25000;
    const total = subtotal + deliveryFee;

    const cartItems: CartItem[] = items.map((i, index) => ({
      id: 'guest-' + index,
      userId: 'guest',
      productId: i.productId,
      quantity: i.quantity,
      product: i.product,
    }));

    return {
      items: cartItems,
      itemsCount: items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
      deliveryFee,
      total,
    };
  };

  const loadGuestCart = (): CartSummary => {
    try {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return { items: [], itemsCount: 0, subtotal: 0, deliveryFee: 0, total: 0 };
      const parsed = JSON.parse(raw);
      return calculateGuestCart(parsed);
    } catch {
      return { items: [], itemsCount: 0, subtotal: 0, deliveryFee: 0, total: 0 };
    }
  };

  const refreshCart = async () => {
    if (!isAuthenticated) {
      setCart(loadGuestCart());
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.cart.get();
      if (res.data?.success) {
        setCart(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Sync guest cart upon login
  useEffect(() => {
    const handleLoginSync = async () => {
      try {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        if (raw) {
          const guestItems = JSON.parse(raw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            await api.cart.sync(guestItems);
            localStorage.removeItem(GUEST_CART_KEY);
          }
        }
      } catch (err) {
        console.warn('Cart sync error:', err);
      } finally {
        refreshCart();
      }
    };

    if (isAuthenticated) {
      handleLoginSync();
    } else {
      setCart(loadGuestCart());
    }

    window.addEventListener('auth:login', handleLoginSync);
    return () => window.removeEventListener('auth:login', handleLoginSync);
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Kechirasiz, mahsulot omborda qolmagan', 'error');
      return;
    }

    if (isAuthenticated) {
      try {
        setIsLoading(true);
        const res = await api.cart.add(product.id, quantity);
        if (res.data?.success) {
          setCart(res.data.data);
          showToast(`"${product.name.slice(0, 30)}..." savatga qo‘shildi!`);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Savatga qo‘shishda xatolik', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Guest cart
      const raw = localStorage.getItem(GUEST_CART_KEY);
      let guestItems: Array<{ productId: string; quantity: number; product: Product }> = raw ? JSON.parse(raw) : [];

      const existingIndex = guestItems.findIndex(i => i.productId === product.id);
      if (existingIndex > -1) {
        guestItems[existingIndex].quantity = Math.min(product.stock, guestItems[existingIndex].quantity + quantity);
      } else {
        guestItems.push({ productId: product.id, quantity: Math.min(product.stock, quantity), product });
      }

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
      setCart(calculateGuestCart(guestItems));
      showToast(`"${product.name.slice(0, 30)}..." savatga qo‘shildi!`);
    }
  };

  const updateQuantity = async (itemId: string, productId: string, quantity: number) => {
    if (isAuthenticated) {
      try {
        const res = await api.cart.update(itemId, quantity);
        if (res.data?.success) {
          setCart(res.data.data);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Xatolik', 'error');
      }
    } else {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return;
      let guestItems: Array<{ productId: string; quantity: number; product: Product }> = JSON.parse(raw);

      if (quantity <= 0) {
        guestItems = guestItems.filter(i => i.productId !== productId);
      } else {
        const item = guestItems.find(i => i.productId === productId);
        if (item) {
          item.quantity = Math.min(item.product.stock, quantity);
        }
      }

      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
      setCart(calculateGuestCart(guestItems));
    }
  };

  const removeFromCart = async (itemId: string, productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await api.cart.remove(itemId);
        if (res.data?.success) {
          setCart(res.data.data);
          showToast('Mahsulot savatdan olib tashlandi', 'info');
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Xatolik', 'error');
      }
    } else {
      const raw = localStorage.getItem(GUEST_CART_KEY);
      if (!raw) return;
      let guestItems: Array<{ productId: string; quantity: number; product: Product }> = JSON.parse(raw);
      guestItems = guestItems.filter(i => i.productId !== productId);
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestItems));
      setCart(calculateGuestCart(guestItems));
      showToast('Mahsulot savatdan olib tashlandi', 'info');
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.cart.clear();
        if (res.data?.success) {
          setCart(res.data.data);
        }
      } catch (err: any) {
        showToast(err.response?.data?.message || 'Xatolik', 'error');
      }
    } else {
      localStorage.removeItem(GUEST_CART_KEY);
      setCart({ items: [], itemsCount: 0, subtotal: 0, deliveryFee: 0, total: 0 });
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
