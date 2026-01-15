import Budget from '../models/Budget.js';

export const getBudgets = async (req, res) => {
  try {
    const budget = await Budget.findOne({ owner: req.user.userId });
    res.json(budget||null);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching budgets', error: err.message });
  }
};

export const createBudget = async (req, res) => {
  try {
    const existing = await Budget.findOne(
      { owner: req.user.userId }
      );

    if (existing) {
      return res.status(400).json({ message: "Budget already exists" });
    }

    const budget = await Budget.create({
      amount: req.body.amount,
      owner: req.user.userId
    });
    
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ message: 'Error creating budget', error: err.message });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      { amount: req.body.amount },
      { new: true }
    );

    if (!budget) 
      return res.status(404).json({ message: "Budget not found." });
    
    res.json(budget);
  } catch (err) {
    res.status(400).json({ message: 'Error updating budget', error: err.message });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const result = await Budget.deleteOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Budget not found." });

    res.json({ message: "Budget deleted." });
  } catch (err) {
    res.status(500).json({ message: "Error deleting budget", error: err.message });
  }
};