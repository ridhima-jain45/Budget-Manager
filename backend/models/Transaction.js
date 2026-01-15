import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  amount: { type: Number, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  mode: { type: String },
  type: { type: String, enum: ["income", "expense"], default: "expense" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Transaction", transactionSchema);
