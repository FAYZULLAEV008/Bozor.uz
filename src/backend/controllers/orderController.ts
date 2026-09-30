import { Response } from 'express';
import { db } from '../db/database.ts';
import { AuthenticatedRequest } from '../middleware/auth.ts';
import { Order, OrderItem, OrderStatus, PaymentStatus } from '../types/index.ts';

export const createOrder = (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { items, shippingAddress, paymentMethod = 'CASH', deliveryMethod = 'DELIVERY', notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Buyurtma uchun mahsulotlar tanlanmagan' });
    }

    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    const orderId = 'ord-' + Date.now();

    for (const item of items) {
      const product = db.products.findById(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Mahsulot topilmadi: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `"${product.name}" mahsulotidan omborda yetarli miqdor yo‘q (Mavjud: ${product.stock} ta)`,
        });
      }

      // Deduct stock
      db.products.update(product.id, {
        stock: product.stock - item.quantity,
      });

      const linePrice = product.price;
      subtotal += linePrice * item.quantity;

      orderItems.push({
        id: 'item-' + Math.random().toString(36).substring(2, 9),
        orderId,
        productId: product.id,
        name: product.name,
        price: linePrice,
        quantity: item.quantity,
        image: product.images[0] || '',
        createdAt: new Date().toISOString(),
      });
    }

    const deliveryFee = deliveryMethod === 'PICKUP' || subtotal >= 200000 ? 0 : 25000;
    const total = subtotal + deliveryFee;

    // Payment simulation
    const isOnlinePayment = ['CLICK', 'PAYME', 'UZUM'].includes(paymentMethod);
    const paymentStatus: PaymentStatus = isOnlinePayment ? 'PAID' : 'PENDING';

    const orderNumber = `BZ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      userId,
      subtotal,
      deliveryFee,
      total,
      status: 'PENDING',
      paymentMethod,
      paymentStatus,
      shippingAddress,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: orderItems,
    };

    db.orders.create(newOrder);

    // Clear user cart
    db.cartItems.clearUserCart(userId);

    // Notification to customer
    db.notifications.create({
      id: 'notif-' + Date.now(),
      userId,
      title: `Yangi buyurtma ${orderNumber} qabul qilindi! 🎉`,
      message: `Buyurtmangiz umumiy qiymati: ${total.toLocaleString('uz-UZ')} so'm. Tez orada kuryer siz bilan bog'lanadi.`,
      type: 'ORDER',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Buyurtmangiz muvaffaqiyatli rasmiylashtirildi!',
      data: newOrder,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Buyurtma yaratishda xatolik',
    });
  }
};

export const getOrders = (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user!;
    let orders: Order[] = [];

    if (user.role === 'ADMIN') {
      orders = db.orders.findMany();
    } else {
      orders = db.orders.findMany(o => o.userId === user.id);
    }

    // Sort newest first
    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Buyurtmalarni yuklashda xatolik',
    });
  }
};

export const getOrderById = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = db.orders.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    // Security: user can only view their own order unless admin or seller
    const user = req.user!;
    if (user.role !== 'ADMIN' && order.userId !== user.id) {
      // Check if seller owns any product in this order
      const seller = db.sellers.findByUserId(user.id);
      const isSellerOfItem = order.items?.some(item => {
        const prod = db.products.findById(item.productId);
        return prod && seller && prod.sellerId === seller.id;
      });

      if (!isSellerOfItem) {
        return res.status(403).json({ success: false, message: 'Siz ushbu buyurtmani ko‘ra olmaysiz' });
      }
    }

    return res.json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Buyurtma ma’lumotlarini yuklashda xatolik',
    });
  }
};

export const updateOrderStatus = (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = db.orders.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    }

    const updated = db.orders.update(id, {
      ...(status && { status: status as OrderStatus }),
      ...(paymentStatus && { paymentStatus: paymentStatus as PaymentStatus }),
    });

    // Notify customer on status update
    if (status && status !== order.status) {
      const statusLabels: Record<string, string> = {
        CONFIRMED: 'tasdiqlandi ✅',
        PROCESSING: 'tayyorlanmoqda 📦',
        SHIPPED: 'yetkazib berishga yuborildi 🚚',
        DELIVERED: 'yetkazib berildi va topshirildi 🎉',
        CANCELLED: 'bekor qilindi ❌',
      };

      db.notifications.create({
        id: 'notif-' + Date.now(),
        userId: order.userId,
        title: `Buyurtma holati o‘zgardi (${order.orderNumber})`,
        message: `Buyurtmangiz ${statusLabels[status] || status}.`,
        type: 'ORDER',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      message: 'Buyurtma holati yangilandi',
      data: updated,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Buyurtma holatini yangilashda xatolik',
    });
  }
};
