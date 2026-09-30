import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';

export const getNotifications = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const notifications = db.notifications.findByUserId(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    return res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Bildirishnomalarni yuklashda xatolik',
    });
  }
};

export const markAsRead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    db.notifications.markAsRead(id, userId);

    return res.json({
      success: true,
      message: 'Bildirishnoma o‘qilgan deb belgilandi',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Xatolik',
    });
  }
};

export const markAllAsRead = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.notifications.markAllAsRead(userId);

    return res.json({
      success: true,
      message: 'Barcha bildirishnomalar o‘qildi',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Xatolik',
    });
  }
};
