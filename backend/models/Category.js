import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true, default: 0 },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);