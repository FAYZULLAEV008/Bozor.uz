import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth.ts';
import { db } from '../db/database.ts';
import { JwtUserPayload, Role } from '../types/index.ts';

export interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload & { dbUser?: any };
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Avtorizatsiyadan o‘tishingiz kerak (Token topilmadi)',
    });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({
      success: false,
      message: 'Yaroqsiz yoki muddati o‘tgan token. Iltimos, qaytadan tizimga kiring.',
    });
  }

  const user = db.users.findById(payload.id);
  if (!user || user.status === 'BLOCKED') {
    return res.status(403).json({
      success: false,
      message: 'Foydalanuvchi hisobi bloklangan yoki mavjud emas',
    });
  }

  req.user = {
    ...payload,
    role: user.role, // Always keep fresh role from DB
    dbUser: user,
  };

  next();
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);
    if (payload) {
      const user = db.users.findById(payload.id);
      if (user && user.status === 'ACTIVE') {
        req.user = {
          ...payload,
          role: user.role,
          dbUser: user,
        };
      }
    }
  }
  next();
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bu amalni bajarish uchun sizda yetarli ruxsat yo‘q',
      });
    }

    next();
  };
};
