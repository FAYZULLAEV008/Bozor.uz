import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getFavorites = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const favorites = db.favorites.findManyByUserId(userId);

    return res.json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sevimlilarni yuklashda xatolik',
    });
  }
};

export const addFavorite = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    const product = db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    const existing = db.favorites.findByUserAndProduct(userId, productId);
    if (!existing) {
      db.favorites.create({
        id: 'fav-' + Date.now(),
        userId,
        productId,
        createdAt: new Date().toISOString(),
      });
    }

    const favorites = db.favorites.findManyByUserId(userId);
    return res.json({
      success: true,
      message: 'Sevimlilarga qo‘shildi',
      data: favorites,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sevimlilarga qo‘shishda xatolik',
    });
  }
};

export const removeFavorite = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { productId } = req.params;

    db.favorites.delete(userId, productId);
    const favorites = db.favorites.findManyByUserId(userId);

    return res.json({
      success: true,
      message: 'Sevimlilardan olib tashlandi',
      data: favorites,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sevimlilardan o‘chirishda xatolik',
    });
  }
};
