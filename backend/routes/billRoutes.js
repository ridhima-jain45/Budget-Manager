import express from "express";
import {
  getAllBills,
  createBill,
  updateBill,
  deleteBill,
} from "../controllers/billsController.js";

const router = express.Router();

router.get("/", getAllBills);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/:id", deleteBill);

export default router;
