import { Router } from 'express';
import * as productController from '../controllers/productController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { createProductSchema } from '../utils/validators.ts';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.post('/', authenticate, authorize('SELLER', 'ADMIN'), validateBody(createProductSchema), productController.createProduct);
router.put('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.updateProduct);
router.delete('/:id', authenticate, authorize('SELLER', 'ADMIN'), productController.deleteProduct);

export default router;
