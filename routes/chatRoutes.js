import express from 'express';
import { generateResponse } from '../controllers/chat.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.post("/chat-handler", protect, generateResponse);

export default router;
