import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;