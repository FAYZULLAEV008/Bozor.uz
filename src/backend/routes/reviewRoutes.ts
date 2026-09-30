import { Router } from 'express';
import * as reviewController from '../controllers/reviewController.ts';
import { authenticate } from '../middleware/auth.ts';
import { validateBody } from '../middleware/validate.ts';
import { createReviewSchema } from '../utils/validators.ts';

const router = Router();

router.get('/:id/reviews', reviewController.getReviews);
router.post('/:id/reviews', authenticate, validateBody(createReviewSchema), reviewController.createReview);

export default router;
