import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Seller } from '../types/index.ts';

export const registerSeller = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { storeName, description, phone, address, logo } = req.body;

    const existing = db.sellers.findByUserId(userId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Siz allaqachon sotuvchi sifatida ro‘yxatdan o‘tgansiz',
      });
    }

    const newSeller: Seller = {
      id: 'seller-' + Date.now(),
      userId,
      storeName,
      description: description || undefined,
      phone: phone || (req.user as any).phone || '+998900000000',
      address: address || undefined,
      logo: logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150',
      rating: 5.0,
      totalSales: 0,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.sellers.create(newSeller);
    db.users.update(userId, { role: 'SELLER' });

    db.notifications.create({
      id: 'notif-' + Date.now(),
      userId,
      title: 'Do‘koningiz muvaffaqiyatli ochildi! 🏪',
      message: `"${storeName}" do‘koni tasdiqlandi. Endi yangi mahsulotlarni joylashtirishingiz mumkin.`,
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Sotuvchi sifatida muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
      data: newSeller,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sotuvchini ro‘yxatdan o‘tkazishda xatolik',
    });
  }
};

export const getSellerDashboard = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const seller = db.sellers.findByUserId(userId) || (req.user!.role === 'ADMIN' ? db.sellers.findById('seller-1') : null);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi profili topilmadi',
      });
    }

    const products = db.products.findMany(p => p.sellerId === seller.id);
    const productIds = new Set(products.map(p => p.id));

    const allOrders = db.orders.findMany();
    // Orders that have items from this seller
    const sellerOrders = allOrders.filter(o => o.items?.some(i => productIds.has(i.productId)));

    let totalRevenue = 0;
    let totalItemsSold = 0;

    sellerOrders.forEach(o => {
      o.items?.forEach(i => {
        if (productIds.has(i.productId)) {
          totalRevenue += i.price * i.quantity;
          totalItemsSold += i.quantity;
        }
      });
    });

    const recentOrders = sellerOrders.slice(0, 5);

    return res.json({
      success: true,
      data: {
        seller,
        statistics: {
          totalProducts: products.length,
          totalOrders: sellerOrders.length,
          totalRevenue,
          totalItemsSold,
          activeProducts: products.filter(p => p.status === 'APPROVED' && p.stock > 0).length,
          lowStockProducts: products.filter(p => p.stock < 5).length,
        },
        recentOrders,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sotuvchi panel ma’lumotlarini yuklashda xatolik',
    });
  }
};

export const getSellerProducts = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const seller = db.sellers.findByUserId(userId) || (req.user!.role === 'ADMIN' ? db.sellers.findById('seller-1') : null);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi profili topilmadi',
      });
    }

    const products = db.products.findMany(p => p.sellerId === seller.id);
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotlarni yuklashda xatolik',
    });
  }
};

export const getSellerOrders = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const seller = db.sellers.findByUserId(userId) || (req.user!.role === 'ADMIN' ? db.sellers.findById('seller-1') : null);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Sotuvchi profili topilmadi',
      });
    }

    const products = db.products.findMany(p => p.sellerId === seller.id);
    const productIds = new Set(products.map(p => p.id));

    const orders = db.orders.findMany(o => Boolean(o.items?.some(i => productIds.has(i.productId))));
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sotuvchi buyurtmalarini yuklashda xatolik',
    });
  }
};
