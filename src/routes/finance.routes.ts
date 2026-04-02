import { Router } from "express";
import * as financeController from "../controllers/finance.controller";

const router = Router();

router.get("/", ...financeController.listFinanceEntries);
router.get("/summary", ...financeController.getFinanceSummary);
router.post("/", ...financeController.createFinanceEntry);
router.patch("/:id", ...financeController.updateFinanceEntry);
router.delete("/:id", ...financeController.deleteFinanceEntry);

export default router;
