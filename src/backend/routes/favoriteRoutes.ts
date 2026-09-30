import { Router } from 'express';
import * as favoriteController from '../controllers/favoriteController.ts';
import { authenticate } from '../middleware/auth.ts';

const router = Router();

router.use(authenticate);

router.get('/', favoriteController.getFavorites);
router.post('/:productId', favoriteController.addFavorite);
router.delete('/:productId', favoriteController.removeFavorite);

export default router;
