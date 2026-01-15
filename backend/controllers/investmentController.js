import Investment from "../models/Investment.js";

// ➕ Add investment
export const addInvestment = async (req, res) => {
  try {
    const investment = new Investment({
      ...req.body,
      owner: req.user.userId,  // user from middleware
    });

    const saved = await investment.save();
    res.status(201).json(saved);

  } catch (err) {
    console.error("Investment Add Error:", err);
    res.status(400).json({
      message: "Invalid investment data",
      error: err.message,
    });
  }
};

// 📌 Get all investments for logged-in user
export const getInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ owner: req.user.userId });
    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch investments" });
  }
};

//  Update investment
export const updateInvestment = async (req, res) => {
  try {
    const updated = await Investment.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(400).json({ message: "Error updating investment" });
  }
};

// 🗑 Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    const deleted = await Investment.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Investment not found" });
    }

    res.json({ message: "Investment deleted" });

  } catch (err) {
    res.status(400).json({ message: "Error deleting investment" });
  }
};
