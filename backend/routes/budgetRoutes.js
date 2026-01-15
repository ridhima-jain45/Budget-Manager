import express from 'express';
import { getBudgets, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getBudgets);
router.post('/', authMiddleware, createBudget);
router.put('/:id', authMiddleware, updateBudget);
router.delete('/:id', authMiddleware, deleteBudget);

export default router;