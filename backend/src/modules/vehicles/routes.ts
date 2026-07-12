import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as vehiclesService from "./service";
import { createVehicleSchema, updateVehicleSchema, listVehiclesQuerySchema } from "./validation";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("FLEET_MANAGER", "DRIVER", "FINANCIAL_ANALYST"),
  asyncHandler(async (req, res) => {
    const filters = listVehiclesQuerySchema.parse(req.query);
    res.json(await vehiclesService.listVehicles(filters));
  })
);

router.get(
  "/available",
  requireRole("FLEET_MANAGER", "DRIVER"),
  asyncHandler(async (_req, res) => {
    res.json(await vehiclesService.listAvailableVehicles());
  })
);

router.get(
  "/:id",
  requireRole("FLEET_MANAGER", "DRIVER", "FINANCIAL_ANALYST"),
  asyncHandler(async (req, res) => {
    res.json(await vehiclesService.getVehicle(req.params.id));
  })
);

router.post(
  "/",
  requireRole("FLEET_MANAGER"),
  asyncHandler(async (req, res) => {
    const data = createVehicleSchema.parse(req.body);
    res.status(201).json(await vehiclesService.createVehicle(data));
  })
);

router.put(
  "/:id",
  requireRole("FLEET_MANAGER"),
  asyncHandler(async (req, res) => {
    const data = updateVehicleSchema.parse(req.body);
    res.json(await vehiclesService.updateVehicle(req.params.id, data));
  })
);

router.patch(
  "/:id/retire",
  requireRole("FLEET_MANAGER"),
  asyncHandler(async (req, res) => {
    res.json(await vehiclesService.retireVehicle(req.params.id));
  })
);

router.delete(
  "/:id",
  requireRole("FLEET_MANAGER"),
  asyncHandler(async (req, res) => {
    res.json(await vehiclesService.deleteVehicle(req.params.id));
  })
);

export default router;
