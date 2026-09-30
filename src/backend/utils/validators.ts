import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 ta belgidan iborat bo'lishi kerak"),
  email: z.string().email("To'g'ri elektron pochta manzilini kiriting"),
  phone: z.string().min(9, "Telefon raqami kamida 9 ta raqam bo'lishi kerak"),
  password: z.string().min(6, "Parol kamida 6 ta belgidan iborat bo'lishi kerak"),
  confirmPassword: z.string().optional(),
}).refine(data => !data.confirmPassword || data.password === data.confirmPassword, {
  message: "Parollar bir-biriga mos kelmadi",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email("To'g'ri elektron pochta manzilini kiriting"),
  password: z.string().min(1, "Parolni kiriting"),
});

export const createProductSchema = z.object({
  name: z.string().min(3, "Mahsulot nomi kamida 3 ta belgidan iborat bo'lishi kerak"),
  description: z.string().min(10, "Tavsif kamida 10 ta belgidan iborat bo'lishi kerak"),
  price: z.number().positive("Narx musbat son bo'lishi kerak"),
  oldPrice: z.number().positive().optional(),
  categoryId: z.string().min(1, "Kategoriyani tanlang"),
  stock: z.number().int().min(0, "Ombor miqdori 0 dan kam bo'lmasligi kerak"),
  sku: z.string().min(2, "SKU kodi kiritilishi shart"),
  brand: z.string().optional(),
  isFlashSale: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).min(1, "Kamida bitta rasm yuklashingiz kerak"),
});

export const createOrderSchema = z.object({
  shippingAddress: z.object({
    fullName: z.string().min(3, "To'liq ism kiritilishi shart"),
    phone: z.string().min(9, "Telefon raqami kiritilishi shart"),
    region: z.string().min(2, "Viloyat kiritilishi shart"),
    city: z.string().min(2, "Shahar/tuman kiritilishi shart"),
    addressLine: z.string().min(5, "Aniq manzil kiritilishi shart"),
    notes: z.string().optional(),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Buyurtma berish uchun savatda tovar bo'lishi kerak"),
  paymentMethod: z.enum(['CASH', 'CLICK', 'PAYME', 'UZUM']),
  deliveryMethod: z.enum(['DELIVERY', 'PICKUP']).optional(),
  notes: z.string().optional(),
});

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3, "Sharh kamida 3 ta belgidan iborat bo'lishi kerak"),
});

export const createCategorySchema = z.object({
  name: z.string().min(2, "Kategoriya nomi kiritilishi kerak"),
  slug: z.string().min(2, "Slug kiritilishi kerak"),
  icon: z.string().optional(),
  image: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
});
