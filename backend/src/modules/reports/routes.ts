import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { requireAuth, requireRole } from "../../middleware/auth";
import { toCsv } from "../../utils/csv";
import * as reportsService from "./service";

const router = Router();

router.use(requireAuth);
router.use(requireRole("FLEET_MANAGER", "FINANCIAL_ANALYST"));

function respond(req: import("express").Request, res: import("express").Response, filename: string, rows: Record<string, unknown>[]) {
  if (req.query.format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
    res.send(toCsv(rows));
    return;
  }
  res.json(rows);
}

router.get(
  "/fuel-efficiency",
  asyncHandler(async (req, res) => {
    respond(req, res, "fuel-efficiency", await reportsService.getFuelEfficiencyReport());
  })
);

router.get(
  "/fleet-utilization",
  asyncHandler(async (req, res) => {
    respond(req, res, "fleet-utilization", await reportsService.getFleetUtilizationReport());
  })
);

router.get(
  "/operational-cost",
  asyncHandler(async (req, res) => {
    respond(req, res, "operational-cost", await reportsService.getOperationalCostReport());
  })
);

router.get(
  "/vehicle-roi",
  asyncHandler(async (req, res) => {
    respond(req, res, "vehicle-roi", await reportsService.getVehicleRoiReport());
  })
);

export default router;
