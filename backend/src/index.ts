import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./modules/auth/routes";
import vehiclesRoutes from "./modules/vehicles/routes";
import driversRoutes from "./modules/drivers/routes";
import tripsRoutes from "./modules/trips/routes";
import maintenanceRoutes from "./modules/maintenance/routes";
import fuelRoutes from "./modules/fuel/routes";
import expensesRoutes from "./modules/expenses/routes";
import dashboardRoutes from "./modules/dashboard/routes";
import reportsRoutes from "./modules/reports/routes";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/vehicles", vehiclesRoutes);
app.use("/api/drivers", driversRoutes);
app.use("/api/trips", tripsRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/fuel", fuelRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportsRoutes);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
