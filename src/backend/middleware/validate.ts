import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map(i => ({
          field: i.path.join('.'),
          message: i.message,
        }));
        return res.status(400).json({
          success: false,
          message: issues[0]?.message || 'Kiritilgan ma’lumotlarda xatolik mavjud',
          errors: issues,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Noto‘g‘ri ma’lumot formati',
      });
    }
  };
};
