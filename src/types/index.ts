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
  productsCount?: number;
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
  sellerName?: string;
  categoryName?: string;
  seller?: Partial<Seller>;
  category?: Partial<Category>;
  reviews?: Review[];
  relatedProducts?: Product[];
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product?: Product;
}

export interface CartSummary {
  items: CartItem[];
  itemsCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
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
