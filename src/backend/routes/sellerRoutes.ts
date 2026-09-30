import { Router } from 'express';
import * as sellerController from '../controllers/sellerController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);

router.post('/register', sellerController.registerSeller);
router.get('/dashboard', authorize('SELLER', 'ADMIN'), sellerController.getSellerDashboard);
router.get('/products', authorize('SELLER', 'ADMIN'), sellerController.getSellerProducts);
router.get('/orders', authorize('SELLER', 'ADMIN'), sellerController.getSellerOrders);

export default router;
