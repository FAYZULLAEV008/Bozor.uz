import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Role, UserStatus, SellerStatus, ProductStatus } from '../types/index.ts';

export const getAdminDashboard = (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = db.users.findMany();
    const sellers = db.sellers.findMany();
    const products = db.products.findMany();
    const orders = db.orders.findMany();

    const totalRevenue = orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;

    // Monthly or status distribution
    const ordersByStatus = {
      PENDING: orders.filter(o => o.status === 'PENDING').length,
      CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
      PROCESSING: orders.filter(o => o.status === 'PROCESSING').length,
      SHIPPED: orders.filter(o => o.status === 'SHIPPED').length,
      DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
      CANCELLED: orders.filter(o => o.status === 'CANCELLED').length,
    };

    return res.json({
      success: true,
      data: {
        statistics: {
          totalUsers: users.length,
          totalSellers: sellers.length,
          totalProducts: products.length,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders,
          deliveredOrders,
        },
        ordersByStatus,
        recentOrders: orders.slice(0, 5),
        recentUsers: users.slice(-5).map(({ passwordHash: _, ...u }) => u),
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Admin panel ma’lumotlarini yuklashda xatolik',
    });
  }
};

export const getAdminUsers = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { q, role, status } = req.query;
    let users = db.users.findMany();

    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query) || u.phone.includes(query));
    }

    if (role && typeof role === 'string' && role !== 'ALL') {
      users = users.filter(u => u.role === role);
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      users = users.filter(u => u.status === status);
    }

    const safeUsers = users.map(({ passwordHash: _, ...u }) => u);
    return res.json({
      success: true,
      data: safeUsers,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Foydalanuvchilarni yuklashda xatolik',
    });
  }
};

export const updateUserRole = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['CUSTOMER', 'SELLER', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz rol' });
    }

    const updated = db.users.update(id, { role: role as Role });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    // If upgrading to SELLER and no seller profile exists, auto-create one
    if (role === 'SELLER') {
      const existingSeller = db.sellers.findByUserId(id);
      if (!existingSeller) {
        db.sellers.create({
          id: 'seller-' + Date.now(),
          userId: id,
          storeName: updated.name + ' Do‘koni',
          phone: updated.phone,
          rating: 5.0,
          totalSales: 0,
          status: 'APPROVED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const { passwordHash: _, ...safeUser } = updated;
    return res.json({
      success: true,
      message: 'Foydalanuvchi roli yangilandi',
      data: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Rolni yangilashda xatolik',
    });
  }
};

export const updateUserStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['ACTIVE', 'BLOCKED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz holat' });
    }

    // Protect super admin
    if (id === 'user-admin-1' && status === 'BLOCKED') {
      return res.status(400).json({ success: false, message: 'Asosiy admin hisobini bloklash mumkin emas' });
    }

    const updated = db.users.update(id, { status: status as UserStatus });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    return res.json({
      success: true,
      message: `Foydalanuvchi holati: ${status === 'ACTIVE' ? 'Faol' : 'Bloklandi'}`,
      data: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Holatni yangilashda xatolik',
    });
  }
};

export const getAdminSellers = (req: AuthenticatedRequest, res: Response) => {
  try {
    const sellers = db.sellers.findMany();
    const enriched = sellers.map(s => {
      const user = db.users.findById(s.userId);
      const productsCount = db.products.findMany(p => p.sellerId === s.id).length;
      return {
        ...s,
        user: user ? { name: user.name, email: user.email, phone: user.phone } : null,
        productsCount,
      };
    });

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sotuvchilarni yuklashda xatolik',
    });
  }
};

export const updateSellerStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz sotuvchi holati' });
    }

    const updated = db.sellers.update(id, { status: status as SellerStatus });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Sotuvchi topilmadi' });
    }

    return res.json({
      success: true,
      message: 'Sotuvchi holati yangilandi',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sotuvchi holatini yangilashda xatolik',
    });
  }
};

export const getAdminProducts = (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = db.products.findMany();
    const enriched = products.map(p => {
      const seller = db.sellers.findById(p.sellerId);
      const cat = db.categories.findById(p.categoryId);
      return {
        ...p,
        sellerName: seller?.storeName || 'Noma’lum',
        categoryName: cat?.name || 'Noma’lum',
      };
    });

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotlarni yuklashda xatolik',
    });
  }
};

export const updateAdminProductStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['APPROVED', 'PENDING', 'REJECTED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Yaroqsiz mahsulot holati' });
    }

    const updated = db.products.update(id, { status: status as ProductStatus });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    return res.json({
      success: true,
      message: 'Mahsulot holati yangilandi',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulot holatini yangilashda xatolik',
    });
  }
};

export const getAdminOrders = (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = db.orders.findMany();
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Buyurtmalarni yuklashda xatolik',
    });
  }
};

export const resetData = (req: AuthenticatedRequest, res: Response) => {
  try {
    db.resetToSeed();
    return res.json({
      success: true,
      message: 'Baza boshlang‘ich holatga qaytarildi (Demo ma’lumotlar yangilandi)',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Bazani qayta tiklashda xatolik',
    });
  }
};
