import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driverProfile.deleteMany();
  await prisma.vehicle.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  await prisma.user.createMany({
    data: [
      { email: "fleet.manager@transitops.demo", name: "Fleet Manager", role: "FLEET_MANAGER", passwordHash },
      { email: "driver@transitops.demo", name: "Dispatch Driver", role: "DRIVER", passwordHash },
      { email: "safety.officer@transitops.demo", name: "Safety Officer", role: "SAFETY_OFFICER", passwordHash },
      { email: "finance@transitops.demo", name: "Financial Analyst", role: "FINANCIAL_ANALYST", passwordHash },
    ],
    skipDuplicates: true,
  });

  const van05 = await prisma.vehicle.create({
    data: {
      regNumber: "GJ01AB452",
      name: "VAN-05",
      type: "Van",
      maxLoadCapacity: 500,
      odometer: 74000,
      acquisitionCost: 620000,
      region: "North",
      status: "AVAILABLE",
    },
  });

  const truck11 = await prisma.vehicle.create({
    data: {
      regNumber: "GJ01AB998",
      name: "TRUCK-11",
      type: "Truck",
      maxLoadCapacity: 5000,
      odometer: 182000,
      acquisitionCost: 2450000,
      region: "West",
      status: "ON_TRIP",
    },
  });

  const mini03 = await prisma.vehicle.create({
    data: {
      regNumber: "GJ01AB120",
      name: "MINI-03",
      type: "Mini",
      maxLoadCapacity: 1000,
      odometer: 66000,
      acquisitionCost: 410000,
      region: "East",
      status: "IN_SHOP",
    },
  });

  await prisma.vehicle.create({
    data: {
      regNumber: "GJ01AB008",
      name: "VAN-09",
      type: "Van",
      maxLoadCapacity: 750,
      odometer: 241900,
      acquisitionCost: 590000,
      region: "South",
      status: "RETIRED",
    },
  });

  const alex = await prisma.driverProfile.create({
    data: {
      name: "Alex Johnson",
      licenseNumber: "LIC-001",
      licenseCategory: "HMV",
      licenseExpiry: new Date("2027-06-01"),
      contact: "9800000001",
      safetyScore: 92,
      status: "AVAILABLE",
    },
  });

  const priya = await prisma.driverProfile.create({
    data: {
      name: "Priya Singh",
      licenseNumber: "LIC-002",
      licenseCategory: "LMV",
      licenseExpiry: new Date("2026-12-01"),
      contact: "9800000002",
      safetyScore: 88,
      status: "ON_TRIP",
    },
  });

  await prisma.driverProfile.create({
    data: {
      name: "Ravi Kumar",
      licenseNumber: "LIC-003",
      licenseCategory: "HMV",
      licenseExpiry: new Date("2027-01-01"),
      contact: "9800000003",
      safetyScore: 60,
      status: "SUSPENDED",
    },
  });

  await prisma.driverProfile.create({
    data: {
      name: "Meena Iyer",
      licenseNumber: "LIC-004",
      licenseCategory: "LMV",
      licenseExpiry: new Date("2024-01-01"),
      contact: "9800000004",
      safetyScore: 75,
      status: "AVAILABLE",
    },
  });

  const licenseExpiringSoon = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  await prisma.driverProfile.create({
    data: {
      name: "Karan Mehta",
      licenseNumber: "LIC-005",
      licenseCategory: "HMV",
      licenseExpiry: licenseExpiringSoon,
      contact: "9800000005",
      safetyScore: 85,
      status: "AVAILABLE",
    },
  });

  await prisma.trip.create({
    data: {
      tripCode: "TRIP-DEMO-0001",
      source: "Mumbai",
      destination: "Pune",
      vehicleId: van05.id,
      driverId: alex.id,
      cargoWeight: 300,
      plannedDistance: 150,
      status: "DRAFT",
    },
  });

  const dispatchedAt = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.trip.create({
    data: {
      tripCode: "TRIP-DEMO-0002",
      source: "Delhi",
      destination: "Jaipur",
      vehicleId: truck11.id,
      driverId: priya.id,
      cargoWeight: 3000,
      plannedDistance: 280,
      status: "DISPATCHED",
      dispatchedAt,
    },
  });

  const completedDispatchedAt = new Date(Date.now() - 26 * 60 * 60 * 1000);
  const completedAt = new Date(Date.now() - 20 * 60 * 60 * 1000);
  const completedTrip = await prisma.trip.create({
    data: {
      tripCode: "TRIP-DEMO-0003",
      source: "Ahmedabad",
      destination: "Surat",
      vehicleId: van05.id,
      driverId: alex.id,
      cargoWeight: 400,
      plannedDistance: 260,
      finalOdometer: 74260,
      fuelConsumed: 22,
      revenue: 15000,
      status: "COMPLETED",
      dispatchedAt: completedDispatchedAt,
      completedAt,
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      vehicleId: mini03.id,
      serviceType: "Brake pad replacement",
      cost: 4500,
      status: "ACTIVE",
    },
  });

  await prisma.fuelLog.create({
    data: {
      vehicleId: van05.id,
      tripId: completedTrip.id,
      liters: 22,
      cost: 2100,
    },
  });

  await prisma.expense.create({
    data: {
      vehicleId: van05.id,
      tripId: completedTrip.id,
      category: "TOLL",
      amount: 350,
    },
  });

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
