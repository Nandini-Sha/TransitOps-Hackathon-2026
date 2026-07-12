# TransitOps Backend — API Reference

Base URL (via Vite proxy from frontend dev server): `/api`
Direct: `http://localhost:4000/api`

## Auth

JWT is stored in an **httpOnly cookie** (`token`), not returned in the response body. The browser sends it automatically on every request to the same origin — `fetch`/`axios` calls just need `credentials: "include"`.

| Method | Path | Auth | Body | Notes |
|---|---|---|---|---|
| POST | `/api/auth/login` | public | `{ email, password }` | sets cookie, returns `{ id, email, name, role }` |
| POST | `/api/auth/logout` | any logged-in user | – | clears cookie |
| GET | `/api/auth/me` | any logged-in user | – | returns current user |

**Demo accounts** (password `password123` for all):
- `fleet.manager@transitops.demo` — role `FLEET_MANAGER`
- `driver@transitops.demo` — role `DRIVER` (creates/dispatches trips)
- `safety.officer@transitops.demo` — role `SAFETY_OFFICER`
- `finance@transitops.demo` — role `FINANCIAL_ANALYST`

Every route below except `/api/auth/login` requires the cookie. A missing/invalid cookie returns `401`. A valid cookie with the wrong role returns `403`.

## Errors

All errors return `{ "error": "message" }` with an appropriate status code (`400` validation, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict/business-rule violation, `500` unexpected). Validation errors (`400`) also include an `issues` array from Zod.

## RBAC matrix

| Role | Vehicles | Drivers | Trips | Fuel/Expense | Dashboard/Reports |
|---|---|---|---|---|---|
| `FLEET_MANAGER` | full | full | – | – | view |
| `DRIVER` | view | view (`/available` only) | full | – | – |
| `SAFETY_OFFICER` | – | full | view | – | – |
| `FINANCIAL_ANALYST` | view | – | – | full | full |

## Vehicles — `/api/vehicles`

Status enum: `AVAILABLE | ON_TRIP | IN_SHOP | RETIRED`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | FM, DRIVER, FA | query: `?status=&type=&region=` |
| GET | `/available` | FM, DRIVER | only `AVAILABLE` vehicles — use this to populate the trip-creation vehicle picker |
| GET | `/:id` | FM, DRIVER, FA | |
| POST | `/` | FM | `{ regNumber, name, type, maxLoadCapacity, odometer, acquisitionCost, region }` — `regNumber` must be unique (409 on dupe) |
| PUT | `/:id` | FM | partial body, any subset of create fields |
| PATCH | `/:id/retire` | FM | 409 if vehicle is `ON_TRIP` |

## Drivers — `/api/drivers`

Status enum: `AVAILABLE | ON_TRIP | OFF_DUTY | SUSPENDED`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | FM, SO | full profiles |
| GET | `/available` | FM, SO, DRIVER | only `AVAILABLE` + non-expired license; returns narrow fields `{id, name, licenseCategory}` — use for the trip-creation driver picker |
| GET | `/:id` | FM, SO | |
| POST | `/` | FM, SO | `{ name, licenseNumber, licenseCategory, licenseExpiry, contact, safetyScore }` — `licenseNumber` unique |
| PUT | `/:id` | FM, SO | partial body |
| PATCH | `/:id/status` | FM, SO | `{ status: "AVAILABLE" \| "OFF_DUTY" \| "SUSPENDED" }` — cannot manually set `ON_TRIP`, 409 if driver currently `ON_TRIP` |

## Trips — `/api/trips`

Status enum/lifecycle: `DRAFT → DISPATCHED → COMPLETED` or `→ CANCELLED` (from `DRAFT` or `DISPATCHED`)

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | DRIVER, SO | query: `?status=` |
| GET | `/:id` | DRIVER, SO | |
| POST | `/` | DRIVER | `{ source, destination, vehicleId, driverId, cargoWeight, plannedDistance, revenue? }` — validates vehicle/driver are `AVAILABLE`, cargo ≤ capacity, license not expired. Creates as `DRAFT`. |
| PATCH | `/:id` | DRIVER | edit — only while `DRAFT` |
| POST | `/:id/dispatch` | DRIVER | `DRAFT → DISPATCHED`; atomically flips vehicle+driver to `ON_TRIP`. 409 if no longer eligible (race-safe). |
| POST | `/:id/complete` | DRIVER | `{ finalOdometer, fuelConsumed, fuelCost? }` — `DISPATCHED → COMPLETED`; atomically restores vehicle+driver to `AVAILABLE`, updates vehicle odometer, writes a `FuelLog` if `fuelCost` given |
| POST | `/:id/cancel` | DRIVER | `DRAFT` or `DISPATCHED → CANCELLED`; restores vehicle+driver to `AVAILABLE` if it was dispatched |

## Maintenance — `/api/maintenance`

Status enum: `ACTIVE | COMPLETED`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | FM | |
| GET | `/:id` | FM | |
| POST | `/` | FM | `{ vehicleId, serviceType, cost, date? }` — creates `ACTIVE`, flips vehicle to `IN_SHOP`. 409 if vehicle `ON_TRIP` or `RETIRED`. |
| PUT | `/:id` | FM | edit — only while `ACTIVE` |
| POST | `/:id/complete` | FM | `ACTIVE → COMPLETED`; restores vehicle to `AVAILABLE` unless vehicle is `RETIRED` |

## Fuel — `/api/fuel`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | FA | |
| POST | `/` | FA | `{ vehicleId, tripId?, liters, cost, date? }` |
| PUT | `/:id` | FA | partial body |
| DELETE | `/:id` | FA | |

## Expenses — `/api/expenses`

Category enum: `TOLL | MISC`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/` | FA | |
| POST | `/` | FA | `{ vehicleId, tripId?, category, amount, date? }` |
| PUT | `/:id` | FA | partial body |
| DELETE | `/:id` | FA | |

## Dashboard — `/api/dashboard`

| Method | Path | Roles | Notes |
|---|---|---|---|
| GET | `/kpis` | FM, FA | query: `?type=&status=&region=` (filters apply to vehicle-based KPIs). Returns `{ activeVehicles, availableVehicles, vehiclesInMaintenance, activeTrips, pendingTrips, driversOnDuty, fleetUtilizationPct }` |

## Reports — `/api/reports`

All support `?format=csv` to download instead of JSON.

| Method | Path | Roles | Returns |
|---|---|---|---|
| GET | `/fuel-efficiency` | FM, FA | per vehicle: `totalDistanceKm, totalFuelLiters, kmPerLiter` |
| GET | `/fleet-utilization` | FM, FA | per vehicle: `tripHours, utilizationPct` |
| GET | `/operational-cost` | FM, FA | per vehicle: `fuelCost, maintenanceCost, totalOperationalCost` |
| GET | `/vehicle-roi` | FM, FA | per vehicle: `revenue, operationalCost, acquisitionCost, roiPct, revenueAvailable` — `roiPct` is `null` when no trip on that vehicle has a `revenue` value set yet |

## Running locally

From repo root: `docker compose up --build`, then from inside the container:
```bash
docker compose exec app sh -c "cd backend && npx prisma migrate dev"   # first time / schema changes
docker compose exec app sh -c "cd backend && npx prisma db seed"       # load demo data
```
API on `http://localhost:4000`, health check at `/health`.
