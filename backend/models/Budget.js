import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;