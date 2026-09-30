import { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Category } from '../types/index.ts';

export const getCategories = (req: Request, res: Response) => {
  try {
    const { includeInactive } = req.query;
    const categories = db.categories.findMany(c => (includeInactive === 'true' ? true : c.isActive));
    categories.sort((a, b) => a.order - b.order);

    // Count products per category
    const withCount = categories.map(cat => ({
      ...cat,
      productsCount: db.products.findMany(p => p.categoryId === cat.id && p.status === 'APPROVED').length,
    }));

    return res.json({
      success: true,
      data: withCount,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kategoriyalarni yuklashda xatolik',
    });
  }
};

export const getCategoryById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let cat = db.categories.findById(id);
    if (!cat) {
      cat = db.categories.findBySlug(id);
    }

    if (!cat) {
      return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    }

    const products = db.products.findMany(p => p.categoryId === cat!.id && p.status === 'APPROVED');

    return res.json({
      success: true,
      data: {
        ...cat,
        products,
        productsCount: products.length,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kategoriyani yuklashda xatolik',
    });
  }
};

export const createCategory = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, icon, image, order, isActive } = req.body;

    const existingSlug = db.categories.findBySlug(slug);
    if (existingSlug) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu slug bilan kategoriya allaqachon mavjud',
      });
    }

    const newCategory: Category = {
      id: 'cat-' + slug.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name,
      slug,
      icon: icon || 'Box',
      image: image || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300',
      order: Number(order) || db.categories.findMany().length + 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString(),
    };

    db.categories.create(newCategory);

    return res.status(201).json({
      success: true,
      message: 'Kategoriya yaratildi',
      data: newCategory,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kategoriya yaratishda xatolik',
    });
  }
};

export const updateCategory = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cat = db.categories.findById(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    }

    const { name, slug, icon, image, order, isActive } = req.body;

    const updated = db.categories.update(id, {
      ...(name && { name }),
      ...(slug && { slug }),
      ...(icon && { icon }),
      ...(image && { image }),
      ...(order !== undefined && { order: Number(order) }),
      ...(isActive !== undefined && { isActive: Boolean(isActive) }),
    });

    return res.json({
      success: true,
      message: 'Kategoriya yangilandi',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kategoriyani yangilashda xatolik',
    });
  }
};

export const deleteCategory = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const cat = db.categories.findById(id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Kategoriya topilmadi' });
    }

    // Check if products exist in this category
    const hasProducts = db.products.findMany(p => p.categoryId === id).length > 0;
    if (hasProducts) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu kategoriyada mahsulotlar bor. Avval ularni boshqa kategoriyaga o‘tkazing.',
      });
    }

    db.categories.delete(id);
    return res.json({
      success: true,
      message: 'Kategoriya o‘chirildi',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Kategoriyani o‘chirishda xatolik',
    });
  }
};
