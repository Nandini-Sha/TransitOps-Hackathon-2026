import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as fuelService from "./service";
import { createFuelLogSchema, updateFuelLogSchema } from "./validation";

const router = Router();

router.use(requireAuth);
router.use(requireRole("FINANCIAL_ANALYST"));

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(await fuelService.listFuelLogs());
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createFuelLogSchema.parse(req.body);
    res.status(201).json(await fuelService.createFuelLog(data));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateFuelLogSchema.parse(req.body);
    res.json(await fuelService.updateFuelLog(req.params.id, data));
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await fuelService.deleteFuelLog(req.params.id);
    res.status(204).send();
  })
);

export default router;
