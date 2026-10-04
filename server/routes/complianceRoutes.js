import express from 'express';
import { calculateCompliance, getComplianceByOrderId, getAllCompliance } from '../controllers/complianceController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllCompliance);

router.route('/calculate')
  .post(protect, calculateCompliance);

router.route('/:orderId')
  .get(protect, getComplianceByOrderId);

export default router;
