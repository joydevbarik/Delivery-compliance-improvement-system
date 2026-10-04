import express from 'express';
import { chatWithAI } from '../controllers/chatController.js';

const router = express.Router();

// POST /api/chat
router.post('/', chatWithAI);

export default router;
