import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  addInvestment,
  getInvestments,
  updateInvestment,
  deleteInvestment
} from "../controllers/investmentController.js";

const router = express.Router();

// All routes protected
router.use(authMiddleware);

// GET all investments
router.get("/", getInvestments);

// ADD investment
router.post("/", addInvestment);

// UPDATE investment
router.put("/:id", updateInvestment);

// DELETE investment
router.delete("/:id", deleteInvestment);

export default router;

