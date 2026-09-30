import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { CartItem } from '../types/index.ts';

const calculateCartSummary = (cartItems: any[]) => {
  const validItems = cartItems.filter(item => item.product && item.product.stock > 0);
  const subtotal = validItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const deliveryFee = subtotal >= 200000 || subtotal === 0 ? 0 : 25000;
  const total = subtotal + deliveryFee;

  return {
    items: cartItems,
    itemsCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    subtotal,
    deliveryFee,
    total,
  };
};

export const getCart = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const items = db.cartItems.findManyByUserId(userId);
    const summary = calculateCartSummary(items);

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Savatni yuklashda xatolik',
    });
  }
};

export const addToCart = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId, quantity = 1 } = req.body;

    const product = db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Mahsulot omborda qolmagan' });
    }

    const qtyToAdd = Math.max(1, Number(quantity) || 1);
    const existing = db.cartItems.findByUserAndProduct(userId, productId);

    if (existing) {
      const newQty = Math.min(product.stock, existing.quantity + qtyToAdd);
      db.cartItems.update(existing.id, { quantity: newQty });
    } else {
      const newItem: CartItem = {
        id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        userId,
        productId,
        quantity: Math.min(product.stock, qtyToAdd),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      db.cartItems.create(newItem);
    }

    const items = db.cartItems.findManyByUserId(userId);
    const summary = calculateCartSummary(items);

    return res.json({
      success: true,
      message: 'Mahsulot savatga qo‘shildi',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Savatga qo‘shishda xatolik',
    });
  }
};

export const updateCartItem = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const item = db.cartItems.findById(itemId);
    if (!item || item.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Savat elementi topilmadi' });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      db.cartItems.delete(itemId);
    } else {
      const product = db.products.findById(item.productId);
      const safeQty = product ? Math.min(product.stock, qty) : qty;
      db.cartItems.update(itemId, { quantity: safeQty });
    }

    const items = db.cartItems.findManyByUserId(userId);
    const summary = calculateCartSummary(items);

    return res.json({
      success: true,
      message: 'Savat yangilandi',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Savatni yangilashda xatolik',
    });
  }
};

export const removeCartItem = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { itemId } = req.params;

    const item = db.cartItems.findById(itemId);
    if (!item || item.userId !== userId) {
      return res.status(404).json({ success: false, message: 'Savat elementi topilmadi' });
    }

    db.cartItems.delete(itemId);
    const items = db.cartItems.findManyByUserId(userId);
    const summary = calculateCartSummary(items);

    return res.json({
      success: true,
      message: 'Mahsulot savatdan olib tashlandi',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotni o‘chirishda xatolik',
    });
  }
};

export const clearCart = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.cartItems.clearUserCart(userId);

    return res.json({
      success: true,
      message: 'Savat tozalandi',
      data: {
        items: [],
        itemsCount: 0,
        subtotal: 0,
        deliveryFee: 0,
        total: 0,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Savatni tozalashda xatolik',
    });
  }
};

export const syncGuestCart = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { items = [] } = req.body;

    if (Array.isArray(items)) {
      for (const guestItem of items) {
        if (!guestItem.productId) continue;
        const product = db.products.findById(guestItem.productId);
        if (!product || product.stock <= 0) continue;

        const existing = db.cartItems.findByUserAndProduct(userId, guestItem.productId);
        const qty = Number(guestItem.quantity) || 1;

        if (existing) {
          db.cartItems.update(existing.id, {
            quantity: Math.min(product.stock, existing.quantity + qty),
          });
        } else {
          db.cartItems.create({
            id: 'cart-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            userId,
            productId: guestItem.productId,
            quantity: Math.min(product.stock, qty),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }

    const currentItems = db.cartItems.findManyByUserId(userId);
    const summary = calculateCartSummary(currentItems);

    return res.json({
      success: true,
      message: 'Savat hisobingiz bilan sinxronlashtirildi',
      data: summary,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Savatni sinxronlashtirishda xatolik',
    });
  }
};
