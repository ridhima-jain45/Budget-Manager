import Bill from "../models/Bill.js";

// GET all bills
export const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find();
    res.json(bills);
  } catch (err) {
    console.error("GET /api/bills failed:", err); // ← this will show the real error
    res.status(500).json({ error: "Failed to fetch bills" });
  }
};

export const createBill = async (req, res) => {
  try {
    const newBill = new Bill(req.body);
    const saved = await newBill.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("POST /api/bills failed:", err); // ← this will show the real error
    res.status(500).json({ error: "Failed to save bill" });
  }
};

// PUT update a bill
export const updateBill = async (req, res) => {
  try {
    const updated = await Bill.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Bill not found" });
    res.json(updated);
  } catch (err) {
    console.error("PUT /api/bills/:id failed:", err);
    res.status(500).json({ error: "Failed to update bill" });
  }
};

// DELETE a bill
export const deleteBill = async (req, res) => {
  try {
    const result = await Bill.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Bill not found" });
    res.status(204).end();
  } catch (err) {
    console.error("DELETE /api/bills/:id failed:", err);
    res.status(500).json({ error: "Failed to delete bill" });
  }
};
