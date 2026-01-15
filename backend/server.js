import dotenv from 'dotenv';
dotenv.config(); // <- load .env immediately

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import investmentRoutes from './routes/investmentRoutes.js';
import billRoutes from './routes/billRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors({
  origin: CLIENT_URL,
  credentials: true
}));

app.use(bodyParser.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/bills', billRoutes);

// Health
app.get('/', (req, res) => {
  res.send('Budget Manager API is running!');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});