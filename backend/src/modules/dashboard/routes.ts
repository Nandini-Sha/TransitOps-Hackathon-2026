import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as dashboardService from "./service";
import { dashboardQuerySchema } from "./validation";

const router = Router();

router.use(requireAuth);
router.use(requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"));

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const filters = dashboardQuerySchema.parse(req.query);
    res.json(await dashboardService.getSummary(filters));
  })
);

export default router;
