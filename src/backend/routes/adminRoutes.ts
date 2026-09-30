import { Router } from 'express';
import * as adminController from '../controllers/adminController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/sellers', adminController.getAdminSellers);
router.put('/sellers/:id/status', adminController.updateSellerStatus);
router.get('/products', adminController.getAdminProducts);
router.put('/products/:id/status', adminController.updateAdminProductStatus);
router.get('/orders', adminController.getAdminOrders);
router.post('/reset-data', adminController.resetData);

export default router;
