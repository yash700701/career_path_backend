import express from 'express';
import { generateRecommendation, getGeneratedRecommendation } from '../controllers/career.js';
import protect from '../middlewares/auth.js';

const router = express.Router();

router.post("/generateRecommendation", protect, generateRecommendation);
router.get('/get-generatedRecommendation', protect, getGeneratedRecommendation);

export default router;
