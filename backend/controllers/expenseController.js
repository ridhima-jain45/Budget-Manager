import Expense from '../models/Expense.js';

export const getExpenses = async (req, res) => {
  try {
    const { budgetId } = req.query;
    const query = { owner: req.user.userId };
    if (budgetId) query.budgetId = budgetId;
    const expenses = await Expense.find(query);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching expenses', error: err.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expense = new Expense({ ...req.body, owner: req.user.userId });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Error creating expense', error: err.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );
    if (!expense) return res.status(404).json({ message: "Expense not found." });
    res.json(expense);
  } catch (err) {
    res.status(400).json({ message: 'Error updating expense', error: err.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const result = await Expense.deleteOne({ _id: req.params.id, owner: req.user.userId });
    if (result.deletedCount === 0) return res.status(404).json({ message: "Expense not found." });
    res.json({ message: "Expense deleted." });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
};