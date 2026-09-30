import { Request, Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Product } from '../types/index.ts';

export const getProducts = (req: Request, res: Response) => {
  try {
    const {
      q,
      category,
      minPrice,
      maxPrice,
      rating,
      sellerId,
      flashSale,
      featured,
      sort = 'newest',
      page = '1',
      limit = '12',
    } = req.query;

    let products = db.products.findMany(p => p.status === 'APPROVED');

    // Text search (name, description, brand, sku)
    if (q && typeof q === 'string' && q.trim()) {
      const query = q.trim().toLowerCase();
      products = products.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        p.sku.toLowerCase().includes(query)
      );
    }

    // Category filter (id or slug)
    if (category && typeof category === 'string' && category !== 'all') {
      const cat = db.categories.findMany(c => c.id === category || c.slug === category)[0];
      if (cat) {
        products = products.filter(p => p.categoryId === cat.id);
      }
    }

    // Price range
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter(p => p.price >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter(p => p.price <= max);
      }
    }

    // Rating
    if (rating) {
      const r = Number(rating);
      if (!isNaN(r)) {
        products = products.filter(p => p.rating >= r);
      }
    }

    // Seller
    if (sellerId && typeof sellerId === 'string') {
      products = products.filter(p => p.sellerId === sellerId);
    }

    // Flash sale
    if (flashSale === 'true' || flashSale === '1') {
      products = products.filter(p => p.isFlashSale);
    }

    // Featured
    if (featured === 'true' || featured === '1') {
      products = products.filter(p => p.isFeatured);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        products.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        products.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        products.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        products.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit as string, 10) || 12);
    const totalPages = Math.ceil(total / limitNum);
    const paginated = products.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    // Enrich with seller name and category name
    const enriched = paginated.map(p => {
      const seller = db.sellers.findById(p.sellerId);
      const cat = db.categories.findById(p.categoryId);
      return {
        ...p,
        sellerName: seller?.storeName || 'Bozor Sotuvchisi',
        categoryName: cat?.name || 'Kategoriya',
      };
    });

    return res.json({
      success: true,
      data: {
        products: enriched,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
        },
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotlarni yuklashda xatolik',
    });
  }
};

export const getProductById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let product = db.products.findById(id);
    if (!product) {
      product = db.products.findBySlug(id);
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Mahsulot topilmadi',
      });
    }

    const seller = db.sellers.findById(product.sellerId);
    const category = db.categories.findById(product.categoryId);
    const reviews = db.reviews.findByProductId(product.id);

    // Also get 4 related products in the same category
    const related = db.products
      .findMany(p => p.categoryId === product!.categoryId && p.id !== product!.id && p.status === 'APPROVED')
      .slice(0, 4);

    return res.json({
      success: true,
      data: {
        ...product,
        seller: seller
          ? {
              id: seller.id,
              storeName: seller.storeName,
              rating: seller.rating,
              totalSales: seller.totalSales,
              phone: seller.phone,
              address: seller.address,
              description: seller.description,
            }
          : null,
        category: category ? { id: category.id, name: category.name, slug: category.slug } : null,
        reviews,
        relatedProducts: related,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotni yuklashda xatolik',
    });
  }
};

export const createProduct = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const seller = db.sellers.findByUserId(userId);

    // If user is admin but has no seller record, fallback to first seller
    const effectiveSellerId = seller?.id || (req.user!.role === 'ADMIN' ? 'seller-1' : null);

    if (!effectiveSellerId) {
      return res.status(403).json({
        success: false,
        message: 'Mahsulot qo‘shish uchun avval sotuvchi sifatida ro‘yxatdan o‘tishingiz kerak',
      });
    }

    const {
      name,
      description,
      price,
      oldPrice,
      categoryId,
      stock,
      sku,
      brand,
      isFlashSale,
      isFeatured,
      specifications,
      images,
    } = req.body;

    const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

    const newProduct: Product = {
      id: 'prod-' + Date.now(),
      sellerId: effectiveSellerId,
      categoryId,
      name,
      slug,
      description,
      price,
      oldPrice: oldPrice || undefined,
      discount: discount || undefined,
      stock: Number(stock) || 0,
      sku,
      brand: brand || undefined,
      rating: 5.0,
      reviewCount: 0,
      isFlashSale: Boolean(isFlashSale),
      isFeatured: Boolean(isFeatured),
      specifications: specifications || {},
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800'],
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.create(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Mahsulot muvaffaqiyatli qo‘shildi',
      data: newProduct,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulot yaratishda xatolik',
    });
  }
};

export const updateProduct = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = db.products.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    // Role check: Seller can only edit their own products; Admin can edit any
    if (req.user!.role !== 'ADMIN') {
      const seller = db.sellers.findByUserId(req.user!.id);
      if (!seller || product.sellerId !== seller.id) {
        return res.status(403).json({
          success: false,
          message: 'Siz faqat o‘z mahsulotingizni tahrirlashingiz mumkin',
        });
      }
    }

    const {
      name,
      description,
      price,
      oldPrice,
      categoryId,
      stock,
      sku,
      brand,
      isFlashSale,
      isFeatured,
      specifications,
      images,
      status,
    } = req.body;

    const discount =
      oldPrice && price && oldPrice > price
        ? Math.round(((oldPrice - price) / oldPrice) * 100)
        : product.discount;

    const updated = db.products.update(id, {
      ...(name && { name }),
      ...(description && { description }),
      ...(price !== undefined && { price: Number(price) }),
      ...(oldPrice !== undefined && { oldPrice: Number(oldPrice) }),
      ...(discount !== undefined && { discount }),
      ...(categoryId && { categoryId }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(sku && { sku }),
      ...(brand !== undefined && { brand }),
      ...(isFlashSale !== undefined && { isFlashSale: Boolean(isFlashSale) }),
      ...(isFeatured !== undefined && { isFeatured: Boolean(isFeatured) }),
      ...(specifications && { specifications }),
      ...(images && { images }),
      ...(status && req.user!.role === 'ADMIN' && { status }),
    });

    return res.json({
      success: true,
      message: 'Mahsulot ma’lumotlari yangilandi',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotni yangilashda xatolik',
    });
  }
};

export const deleteProduct = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const product = db.products.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Mahsulot topilmadi' });
    }

    if (req.user!.role !== 'ADMIN') {
      const seller = db.sellers.findByUserId(req.user!.id);
      if (!seller || product.sellerId !== seller.id) {
        return res.status(403).json({
          success: false,
          message: 'Siz faqat o‘z mahsulotingizni o‘chirishingiz mumkin',
        });
      }
    }

    db.products.delete(id);

    return res.json({
      success: true,
      message: 'Mahsulot muvaffaqiyatli o‘chirildi',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Mahsulotni o‘chirishda xatolik',
    });
  }
};
