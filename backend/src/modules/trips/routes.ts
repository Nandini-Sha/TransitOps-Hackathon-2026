import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import * as tripsService from "./service";
import { createTripSchema, updateTripSchema, completeTripSchema, listTripsQuerySchema } from "./validation";

const router = Router();

router.use(requireAuth);
router.use(requireRole("DRIVER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"));

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filters = listTripsQuerySchema.parse(req.query);
    res.json(await tripsService.listTrips(filters));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    res.json(await tripsService.getTrip(req.params.id));
  })
);

router.post(
  "/",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    const data = createTripSchema.parse(req.body);
    res.status(201).json(await tripsService.createTrip(data));
  })
);

router.patch(
  "/:id",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    const data = updateTripSchema.parse(req.body);
    res.json(await tripsService.updateTrip(req.params.id, data));
  })
);

router.post(
  "/:id/dispatch",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    res.json(await tripsService.dispatchTrip(req.params.id));
  })
);

router.post(
  "/:id/complete",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    const data = completeTripSchema.parse(req.body);
    res.json(await tripsService.completeTrip(req.params.id, data));
  })
);

router.post(
  "/:id/cancel",
  requireRole("DRIVER"),
  asyncHandler(async (req, res) => {
    res.json(await tripsService.cancelTrip(req.params.id));
  })
);

export default router;
