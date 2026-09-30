import { Router } from 'express';
import * as orderController from '../controllers/orderController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { createOrderSchema } from '../utils/validators.ts';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createOrderSchema), orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);
router.put('/:id/status', authorize('SELLER', 'ADMIN'), orderController.updateOrderStatus);

export default router;
