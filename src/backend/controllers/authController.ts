import { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { hashPassword, comparePassword, generateTokens, verifyRefreshToken } from '../utils/auth.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { User } from '../types/index.ts';

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check existing email
    const existingEmail = db.users.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu elektron pochta manzili allaqachon ro‘yxatdan o‘tgan',
      });
    }

    // Check existing phone
    const existingPhone = db.users.findByPhone(phone);
    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu telefon raqami allaqachon ro‘yxatdan o‘tgan',
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser: User = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name,
      email,
      phone,
      passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.create(newUser);
    const { accessToken, refreshToken } = generateTokens(newUser);

    // Welcome notification
    db.notifications.create({
      id: 'notif-' + Date.now(),
      userId: newUser.id,
      title: 'BOZOR.UZ ga xush kelibsiz! 🛍️',
      message: 'Platformamizda minglab mahsulotlarni qulay xarid qiling yoki sotuvchi sifatida o‘z do‘koningizni oching.',
      type: 'SYSTEM',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
      data: {
        user: safeUser,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi',
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Elektron pochta yoki parol noto‘g‘ri',
      });
    }

    if (user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Ushbu hisob ma’muriyat tomonidan bloklangan',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Elektron pochta yoki parol noto‘g‘ri',
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    const seller = db.sellers.findByUserId(user.id);

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Xush kelibsiz, ' + user.name,
      data: {
        user: safeUser,
        seller: seller || null,
        accessToken,
        refreshToken,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kirishda xatolik yuz berdi',
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token taqdim etilmadi',
      });
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Yaroqsiz yoki muddati o‘tgan refresh token',
      });
    }

    const user = db.users.findById(payload.id);
    if (!user || user.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        message: 'Foydalanuvchi hisobi bloklangan yoki mavjud emas',
      });
    }

    const tokens = generateTokens(user);
    return res.json({
      success: true,
      data: tokens,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Tokenni yangilashda xatolik yuz berdi',
    });
  }
};

export const logout = (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Tizimdan muvaffaqiyatli chiqildi',
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = db.users.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Foydalanuvchi topilmadi',
      });
    }

    const seller = db.sellers.findByUserId(user.id);
    const addresses = db.addresses.findByUserId(user.id);
    const orders = db.orders.findMany(o => o.userId === user.id);
    const favorites = db.favorites.findManyByUserId(user.id);

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      data: {
        user: safeUser,
        seller: seller || null,
        stats: {
          ordersCount: orders.length,
          favoritesCount: favorites.length,
          addressesCount: addresses.length,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Profil ma’lumotlarini olishda xatolik',
    });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const userId = req.user!.id;

    if (phone) {
      const existing = db.users.findByPhone(phone);
      if (existing && existing.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Ushbu telefon raqami boshqa foydalanuvchiga tegishli',
        });
      }
    }

    const updated = db.users.update(userId, {
      ...(name && { name }),
      ...(phone && { phone }),
      ...(avatar !== undefined && { avatar }),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    return res.json({
      success: true,
      message: 'Profil ma’lumotlari yangilandi',
      data: safeUser,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Profilni yangilashda xatolik',
    });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const user = db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    const isMatch = await comparePassword(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Joriy parol noto‘g‘ri kiritildi' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak' });
    }

    const newHash = await hashPassword(newPassword);
    db.users.update(userId, { passwordHash: newHash });

    return res.json({
      success: true,
      message: 'Parol muvaffaqiyatli o‘zgartirildi',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Parolni o‘zgartirishda xatolik',
    });
  }
};
