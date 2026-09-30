import fs from 'fs';
import path from 'path';
import {
  User,
  Seller,
  Category,
  Product,
  CartItem,
  Order,
  OrderItem,
  Address,
  Favorite,
  Review,
  Notification,
} from '../types/index.ts';
import {
  initialUsers,
  initialSellers,
  initialCategories,
  initialProducts,
  initialOrders,
  initialReviews,
  initialNotifications,
} from './seedData.ts';

interface DatabaseSchema {
  users: User[];
  sellers: Seller[];
  categories: Category[];
  products: Product[];
  cartItems: CartItem[];
  orders: Order[];
  addresses: Address[];
  favorites: Favorite[];
  reviews: Review[];
  notifications: Notification[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'bozor_db.json');

class DatabaseEngine {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadOrSeed();
  }

  private loadOrSeed(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.products && parsed.products.length >= 20) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, falling back to seed data:', e);
    }

    const seeded: DatabaseSchema = {
      users: initialUsers,
      sellers: initialSellers,
      categories: initialCategories,
      products: initialProducts,
      cartItems: [],
      orders: initialOrders,
      addresses: [
        {
          id: 'addr-1',
          userId: 'user-customer-1',
          title: 'Uy manzili',
          fullName: 'Anvar Karimov',
          phone: '+998971112233',
          region: 'Toshkent shahri',
          city: 'Yunusobod tumani',
          addressLine: 'Amir Temur ko‘chasi, 107A-uy, 45-xonadon',
          isDefault: true,
          createdAt: new Date().toISOString(),
        }
      ],
      favorites: [
        {
          id: 'fav-1',
          userId: 'user-customer-1',
          productId: 'prod-iphone-15-pro-max',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'fav-2',
          userId: 'user-customer-1',
          productId: 'prod-macbook-pro-14-m3',
          createdAt: new Date().toISOString(),
        }
      ],
      reviews: initialReviews,
      notifications: initialNotifications,
    };

    this.persistSync(seeded);
    return seeded;
  }

  private persistSync(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persistSync(this.data);
    }, 100);
  }

  public resetToSeed() {
    this.data = {
      users: initialUsers,
      sellers: initialSellers,
      categories: initialCategories,
      products: initialProducts,
      cartItems: [],
      orders: initialOrders,
      addresses: [],
      favorites: [],
      reviews: initialReviews,
      notifications: initialNotifications,
    };
    this.persistSync(this.data);
    return this.data;
  }

  // Users
  get users() {
    return {
      findMany: (filter?: (u: User) => boolean) => (filter ? this.data.users.filter(filter) : [...this.data.users]),
      findById: (id: string) => this.data.users.find(u => u.id === id),
      findByEmail: (email: string) => this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()),
      findByPhone: (phone: string) => this.data.users.find(u => u.phone === phone),
      create: (user: User) => {
        this.data.users.push(user);
        this.save();
        return user;
      },
      update: (id: string, updates: Partial<User>) => {
        const index = this.data.users.findIndex(u => u.id === id);
        if (index === -1) return null;
        this.data.users[index] = { ...this.data.users[index], ...updates, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.users[index];
      },
    };
  }

  // Sellers
  get sellers() {
    return {
      findMany: (filter?: (s: Seller) => boolean) => (filter ? this.data.sellers.filter(filter) : [...this.data.sellers]),
      findById: (id: string) => this.data.sellers.find(s => s.id === id),
      findByUserId: (userId: string) => this.data.sellers.find(s => s.userId === userId),
      create: (seller: Seller) => {
        this.data.sellers.push(seller);
        this.save();
        return seller;
      },
      update: (id: string, updates: Partial<Seller>) => {
        const index = this.data.sellers.findIndex(s => s.id === id);
        if (index === -1) return null;
        this.data.sellers[index] = { ...this.data.sellers[index], ...updates, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.sellers[index];
      },
    };
  }

  // Categories
  get categories() {
    return {
      findMany: (filter?: (c: Category) => boolean) => (filter ? this.data.categories.filter(filter) : [...this.data.categories]),
      findById: (id: string) => this.data.categories.find(c => c.id === id),
      findBySlug: (slug: string) => this.data.categories.find(c => c.slug === slug),
      create: (cat: Category) => {
        this.data.categories.push(cat);
        this.save();
        return cat;
      },
      update: (id: string, updates: Partial<Category>) => {
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index === -1) return null;
        this.data.categories[index] = { ...this.data.categories[index], ...updates };
        this.save();
        return this.data.categories[index];
      },
      delete: (id: string) => {
        const index = this.data.categories.findIndex(c => c.id === id);
        if (index === -1) return false;
        this.data.categories.splice(index, 1);
        this.save();
        return true;
      },
    };
  }

  // Products
  get products() {
    return {
      findMany: (filter?: (p: Product) => boolean) => (filter ? this.data.products.filter(filter) : [...this.data.products]),
      findById: (id: string) => this.data.products.find(p => p.id === id),
      findBySlug: (slug: string) => this.data.products.find(p => p.slug === slug),
      create: (product: Product) => {
        this.data.products.unshift(product);
        this.save();
        return product;
      },
      update: (id: string, updates: Partial<Product>) => {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index === -1) return null;
        this.data.products[index] = { ...this.data.products[index], ...updates, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.products[index];
      },
      delete: (id: string) => {
        const index = this.data.products.findIndex(p => p.id === id);
        if (index === -1) return false;
        this.data.products.splice(index, 1);
        this.save();
        return true;
      },
    };
  }

  // Cart
  get cartItems() {
    return {
      findManyByUserId: (userId: string) => {
        return this.data.cartItems
          .filter(ci => ci.userId === userId)
          .map(ci => ({
            ...ci,
            product: this.data.products.find(p => p.id === ci.productId),
          }));
      },
      findById: (id: string) => this.data.cartItems.find(ci => ci.id === id),
      findByUserAndProduct: (userId: string, productId: string) =>
        this.data.cartItems.find(ci => ci.userId === userId && ci.productId === productId),
      create: (item: CartItem) => {
        this.data.cartItems.push(item);
        this.save();
        return item;
      },
      update: (id: string, updates: Partial<CartItem>) => {
        const index = this.data.cartItems.findIndex(ci => ci.id === id);
        if (index === -1) return null;
        this.data.cartItems[index] = { ...this.data.cartItems[index], ...updates, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.cartItems[index];
      },
      delete: (id: string) => {
        const index = this.data.cartItems.findIndex(ci => ci.id === id);
        if (index === -1) return false;
        this.data.cartItems.splice(index, 1);
        this.save();
        return true;
      },
      clearUserCart: (userId: string) => {
        this.data.cartItems = this.data.cartItems.filter(ci => ci.userId !== userId);
        this.save();
        return true;
      },
    };
  }

  // Orders
  get orders() {
    return {
      findMany: (filter?: (o: Order) => boolean) => {
        const list = filter ? this.data.orders.filter(filter) : [...this.data.orders];
        return list.map(o => {
          const user = this.data.users.find(u => u.id === o.userId);
          return {
            ...o,
            user: user ? { id: user.id, name: user.name, email: user.email, phone: user.phone } : undefined,
          };
        });
      },
      findById: (id: string) => {
        const o = this.data.orders.find(ord => ord.id === id);
        if (!o) return null;
        const user = this.data.users.find(u => u.id === o.userId);
        return {
          ...o,
          user: user ? { id: user.id, name: user.name, email: user.email, phone: user.phone } : undefined,
        };
      },
      create: (order: Order) => {
        this.data.orders.unshift(order);
        this.save();
        return order;
      },
      update: (id: string, updates: Partial<Order>) => {
        const index = this.data.orders.findIndex(o => o.id === id);
        if (index === -1) return null;
        this.data.orders[index] = { ...this.data.orders[index], ...updates, updatedAt: new Date().toISOString() };
        this.save();
        return this.data.orders[index];
      },
    };
  }

  // Favorites
  get favorites() {
    return {
      findManyByUserId: (userId: string) => {
        return this.data.favorites
          .filter(f => f.userId === userId)
          .map(f => ({
            ...f,
            product: this.data.products.find(p => p.id === f.productId),
          }));
      },
      findByUserAndProduct: (userId: string, productId: string) =>
        this.data.favorites.find(f => f.userId === userId && f.productId === productId),
      create: (fav: Favorite) => {
        this.data.favorites.push(fav);
        this.save();
        return fav;
      },
      delete: (userId: string, productId: string) => {
        const index = this.data.favorites.findIndex(f => f.userId === userId && f.productId === productId);
        if (index === -1) return false;
        this.data.favorites.splice(index, 1);
        this.save();
        return true;
      },
    };
  }

  // Reviews
  get reviews() {
    return {
      findByProductId: (productId: string) => this.data.reviews.filter(r => r.productId === productId),
      create: (rev: Review) => {
        this.data.reviews.unshift(rev);
        // update product rating
        const prodReviews = this.data.reviews.filter(r => r.productId === rev.productId);
        const avgRating = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
        const prod = this.data.products.find(p => p.id === rev.productId);
        if (prod) {
          prod.rating = Number(avgRating.toFixed(2));
          prod.reviewCount = prodReviews.length;
        }
        this.save();
        return rev;
      },
    };
  }

  // Notifications
  get notifications() {
    return {
      findByUserId: (userId: string) =>
        this.data.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      create: (notif: Notification) => {
        this.data.notifications.unshift(notif);
        this.save();
        return notif;
      },
      markAsRead: (id: string, userId: string) => {
        const n = this.data.notifications.find(item => item.id === id && item.userId === userId);
        if (n) {
          n.isRead = true;
          this.save();
          return true;
        }
        return false;
      },
      markAllAsRead: (userId: string) => {
        this.data.notifications.forEach(item => {
          if (item.userId === userId) {
            item.isRead = true;
          }
        });
        this.save();
        return true;
      },
    };
  }

  // Addresses
  get addresses() {
    return {
      findByUserId: (userId: string) => this.data.addresses.filter(a => a.userId === userId),
      create: (addr: Address) => {
        if (addr.isDefault) {
          this.data.addresses.forEach(a => {
            if (a.userId === addr.userId) a.isDefault = false;
          });
        }
        this.data.addresses.push(addr);
        this.save();
        return addr;
      },
      delete: (id: string, userId: string) => {
        const index = this.data.addresses.findIndex(a => a.id === id && a.userId === userId);
        if (index === -1) return false;
        this.data.addresses.splice(index, 1);
        this.save();
        return true;
      },
    };
  }
}

export const db = new DatabaseEngine();
