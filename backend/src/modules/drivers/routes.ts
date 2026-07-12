import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as driversService from "./service";
import {
  createDriverSchema,
  updateDriverSchema,
  updateDriverStatusSchema,
  listDriversQuerySchema,
} from "./validation";

const router = Router();

router.use(requireAuth);

router.get(
  "/",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    const filters = listDriversQuerySchema.parse(req.query);
    res.json(await driversService.listDrivers(filters));
  })
);

router.get(
  "/available",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER", "DRIVER"),
  asyncHandler(async (_req, res) => {
    res.json(await driversService.listAvailableDrivers());
  })
);

router.get(
  "/:id",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    res.json(await driversService.getDriver(req.params.id));
  })
);

router.post(
  "/",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    const data = createDriverSchema.parse(req.body);
    res.status(201).json(await driversService.createDriver(data));
  })
);

router.put(
  "/:id",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    const data = updateDriverSchema.parse(req.body);
    res.json(await driversService.updateDriver(req.params.id, data));
  })
);

router.patch(
  "/:id/status",
  requireRole("FLEET_MANAGER", "SAFETY_OFFICER"),
  asyncHandler(async (req, res) => {
    const { status } = updateDriverStatusSchema.parse(req.body);
    res.json(await driversService.updateDriverStatus(req.params.id, status));
  })
);

export default router;
