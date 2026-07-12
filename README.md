# TransitOps — Smart Transport Operations Platform

Fleet, driver, dispatch, maintenance, fuel/expense management platform. Odoo Hackathon 2026.

**Stack**: Node.js + Express + TypeScript + Prisma (backend) · React + Vite + TypeScript + Tailwind (frontend) · PostgreSQL 16 · Docker Compose

## Setup

```bash
cp .env.example .env
docker compose up --build
docker compose exec app sh -c "cd backend && npx prisma migrate dev"
docker compose exec app sh -c "cd backend && npx prisma db seed"
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000 (health check: `/health`)
- Postgres: localhost:5432 (credentials in `.env`)

Backend and frontend run as two hot-reloading processes inside the same `app` container — edit `backend/src` or `frontend/src` on host, changes reflect immediately. Rebuild (`docker compose up --build`) only after changing a `package.json`. `node_modules` for both live in named Docker volumes, not bind-mounted from host.

## Demo logins

All seeded users share the password `password123`. Each role sees a different set of tabs (RBAC-enforced both frontend and backend):

| Role | Email | Tabs |
|---|---|---|
| Fleet Manager | `fleet.manager@transitops.demo` | Fleet, Maintenance |
| Driver / Dispatcher | `driver@transitops.demo` | Dashboard, Trips |
| Safety Officer | `safety.officer@transitops.demo` | Drivers, Compliance |
| Financial Analyst | `finance@transitops.demo` | Fuel & Expenses, Analytics |

## Features

- **Auth**: email/password, JWT in an httpOnly cookie, RBAC on every route and every UI tab.
- **Dashboard**: KPIs (active/available/maintenance vehicles, active/pending trips, drivers on duty, fleet utilization %), filters, recent-trips board.
- **Fleet**: vehicle CRUD, search/sort, retire. Status (`Available`/`On Trip`/`In Shop`/`Retired`) is derived only — it changes automatically via trip dispatch/completion and maintenance records, never by manual edit.
- **Drivers**: driver CRUD, search/sort, suspend/reinstate.
- **Compliance**: flags expired/expiring-soon licenses and low safety scores; one-click suspend.
- **Trips**: create (cargo-vs-capacity validated), dispatch, complete, cancel — full `Draft → Dispatched → Completed/Cancelled` lifecycle with automatic vehicle/driver status transitions.
- **Maintenance**: log a service record on an available vehicle (auto → `In Shop`); mark complete (auto → `Available`, unless retired).
- **Fuel & Expenses**: standalone fuel logs and toll/misc expenses, auto-computed operational cost.
- **Analytics**: fuel efficiency, fleet utilization, operational cost, vehicle ROI — with charts and CSV/PDF export per report.
- **Settings**: depot/currency/unit preferences (local, Fleet Manager only) and a static RBAC reference table.

## Business rules enforced

- Vehicle registration number is unique; retired/in-shop vehicles are excluded from trip dispatch.
- Drivers with expired licenses or `SUSPENDED` status cannot be dispatched.
- A vehicle or driver already `ON_TRIP` cannot be assigned to another trip.
- Cargo weight cannot exceed the vehicle's max load capacity.
- Dispatch/complete/cancel and maintenance create/complete all drive status transitions automatically and atomically (DB transactions) — nothing sets status directly.

## Structure

```
transitops/
├── docker-compose.yml       # db + app services
├── Dockerfile.dev           # single dev image, runs backend+frontend together
├── .env.example             # copy to .env before running
├── backend/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── index.ts         # Express entrypoint
│   │   ├── modules/         # auth, vehicles, drivers, trips, maintenance, fuel, expenses, reports, dashboard
│   │   ├── middleware/      # auth, rbac, error-handler
│   │   └── utils/           # csv/pdf export helpers
│   └── package.json
└── frontend/
    ├── src/
    │   ├── main.tsx, App.tsx
    │   ├── pages/            # Auth, Dashboard, Fleet, Drivers, Trips, Maintenance, Financials, Settings
    │   ├── components/ui/    # shared Modal, FormField, Button, StatusBadge, KpiCard, SearchInput, AsyncState
    │   └── lib/               # one API client module per domain
    └── package.json
```
