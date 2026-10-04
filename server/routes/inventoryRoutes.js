import express from 'express';
import { getInventoryByProductCode, getAllInventory, updateInventoryStock } from '../controllers/inventoryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getAllInventory);

router.route('/:productCode')
  .get(protect, getInventoryByProductCode)
  .put(protect, updateInventoryStock);

export default router;
