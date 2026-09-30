export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'BLOCKED';
export type SellerStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
export type ProductStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CLICK' | 'PAYME' | 'UZUM';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';
export type NotificationType = 'ORDER' | 'PROMO' | 'SYSTEM';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  description?: string;
  logo?: string;
  phone: string;
  address?: string;
  rating: number;
  totalSales: number;
  status: SellerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  stock: number;
  sku: string;
  brand?: string;
  rating: number;
  reviewCount: number;
  isFlashSale: boolean;
  isFeatured: boolean;
  specifications?: Record<string, string>;
  images: string[];
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  createdAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  region: string;
  city: string;
  addressLine: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface Address {
  id: string;
  userId: string;
  title: string;
  fullName: string;
  phone: string;
  region: string;
  city: string;
  addressLine: string;
  isDefault: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product?: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export interface JwtUserPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
}
