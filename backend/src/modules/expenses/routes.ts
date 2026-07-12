import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as expensesService from "./service";
import { createExpenseSchema, updateExpenseSchema } from "./validation";

const router = Router();

router.use(requireAuth);
router.use(requireRole("FINANCIAL_ANALYST"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await expensesService.listExpenses());
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createExpenseSchema.parse(req.body);
    res.status(201).json(await expensesService.createExpense(data));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateExpenseSchema.parse(req.body);
    res.json(await expensesService.updateExpense(req.params.id, data));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await expensesService.deleteExpense(req.params.id);
    res.status(204).send();
  })
);

export default router;
