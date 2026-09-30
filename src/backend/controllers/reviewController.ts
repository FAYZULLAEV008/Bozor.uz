import { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getReviews = (req: Request, res: Response) => {
  try {
    const { id: productId } = req.params;
    const reviews = db.reviews.findByProductId(productId);
    reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sharhlarni yuklashda xatolik',
    });
  }
};

export const createReview = (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    const { id: productId } = req.params;
    const { rating, comment } = req.body;

    const product = db.products.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    const newReview = db.reviews.create({
      id: 'rev-' + Date.now(),
      userId: user.id,
      productId,
      userName: user.name,
      userAvatar: (user as any).dbUser?.avatar,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Sharhingiz qabul qilindi, rahmat!',
      data: newReview,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Sharh qoldirishda xatolik',
    });
  }
};
