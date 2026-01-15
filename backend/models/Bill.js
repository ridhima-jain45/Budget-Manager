import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    enum: ["Monthly", "Yearly"],
    default: "Monthly",
  },
  paid: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Bill', billSchema);
