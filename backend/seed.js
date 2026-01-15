import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import Budget from './models/Budget.js';
import Expense from './models/Expense.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/budgetmanager';

async function seed() {
  await mongoose.connect(MONGO_URI);

  // Drop existing data
  await User.deleteMany({});
  await Budget.deleteMany({});
  await Expense.deleteMany({});

  // Plain password for demonstration
  const hash = await bcrypt.hash('password123', 10);

  const users = [
    { email: 'alice@example.com', password: hash },
    { email: 'bob@example.com', password: hash },
    { email: 'carol@example.com', password: hash },
  ];

  const createdUsers = await User.insertMany(users);

  const budgets = [
    { name: "Alice's Monthly", amount: 5000, owner: createdUsers[0]._id },
    { name: "Bob's Saving", amount: 2000, owner: createdUsers[1]._id },
    { name: "Carol's Vacation", amount: 7000, owner: createdUsers[2]._id },
  ];
  const createdBudgets = await Budget.insertMany(budgets);

  const expenses = [
    { name: "Food", amount: 700, budgetId: createdBudgets[0]._id, owner: createdUsers[0]._id },
    { name: "Bills", amount: 1200, budgetId: createdBudgets[0]._id, owner: createdUsers[0]._id },
    { name: "Travel", amount: 350, budgetId: createdBudgets[1]._id, owner: createdUsers[1]._id },
    { name: "Rent", amount: 800, budgetId: createdBudgets[1]._id, owner: createdUsers[1]._id },
    { name: "Flight", amount: 3000, budgetId: createdBudgets[2]._id, owner: createdUsers[2]._id },
    { name: "Hotel", amount: 1800, budgetId: createdBudgets[2]._id, owner: createdUsers[2]._id },
  ];

  await Expense.insertMany(expenses);

  console.log('Database seeded with sample data!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});