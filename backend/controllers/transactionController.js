import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';

// Get all transactions for logged-in user
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ owner: req.user.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new transaction
// exports.createTransaction = async (req, res) => {
//   try {
//     const transaction = new Transaction({ ...req.body, owner: req.user.userId });
//     await transaction.save();
//     res.status(201).json(transaction);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };
// server/controllers/transactionsController.js


export const createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      owner: req.user.userId // must come from auth middleware
    });
    await transaction.save();

    await Category.findOneAndUpdate(
  { name: transaction.category, owner: req.user.userId },
  { $inc: { amount: transaction.amount } }  // negative for expenses, positive for income
  );

  res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid transaction data", error: err.message });
  }
};

// Update transaction
export const updateTransaction = async (req, res) => {
  try {
    const oldTransaction = await Transaction.findOne(
      { _id: req.params.id, owner: req.user.userId }
    );
    if (!oldTransaction) return res.status(404).json({ message: "Transaction not found." });
    
    await Category.findOneAndUpdate(
      { name: oldTransaction.category, owner: req.user.userId },
      { $inc: { amount: -Math.abs(oldTransaction.amount) } }
    );

    // Apply the update
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );
    
    await Category.findOneAndUpdate(
      { name: updatedTransaction.category, owner: req.user.userId },
      { $inc: { amount: Math.abs(updatedTransaction.amount) } }
    );

    res.json(updatedTransaction);
  } catch (err) {
    res.status(400).json({ message: "Error updating transaction", error: err.message });
  }
};

// Delete transaction
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, owner: req.user.userId });
    if (!transaction) return res.status(404).json({ message: "Transaction not found." });

    // Reverse the transaction's effect on category
    await Category.findOneAndUpdate(
      { name: transaction.category, owner: req.user.userId },
      { $inc: { amount: -Math.abs(transaction.amount) } }
    );

    await Transaction.deleteOne({ _id: req.params.id, owner: req.user.userId });

    res.json({ message: "Transaction deleted." });
  } catch (err) {
    res.status(400).json({ message: "Error deleting transaction", error: err.message });
  }
};
