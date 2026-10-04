import express from 'express';
import {
  createHelpMessage,
  getAllHelpMessages,
  getUnreadCount,
  replyToHelpMessage,
  closeHelpMessage
} from '../controllers/helpController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .post(protect, createHelpMessage)
  .get(protect, getAllHelpMessages);

router.route('/unread-count')
  .get(protect, getUnreadCount);

router.route('/:id/reply')
  .post(protect, replyToHelpMessage);

router.route('/:id/close')
  .patch(protect, closeHelpMessage);

export default router;
