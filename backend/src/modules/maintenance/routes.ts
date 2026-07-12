import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as maintenanceService from "./service";
import { createMaintenanceSchema, updateMaintenanceSchema } from "./validation";

const router = Router();

router.use(requireAuth);
router.use(requireRole("FLEET_MANAGER"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = req.query.search as string | undefined;
    res.json(await maintenanceService.listMaintenance(search));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await maintenanceService.getMaintenance(req.params.id));
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createMaintenanceSchema.parse(req.body);
    res.status(201).json(await maintenanceService.createMaintenance(data));
  })
);

router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const data = updateMaintenanceSchema.parse(req.body);
    res.json(await maintenanceService.updateMaintenance(req.params.id, data));
  })
);

router.post(
  "/:id/complete",
  asyncHandler(async (req, res) => {
    res.json(await maintenanceService.completeMaintenance(req.params.id));
  })
);

export default router;
