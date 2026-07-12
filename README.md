# TransitOps — Smart Transport Operations Platform

Fleet, driver, dispatch, maintenance, fuel/expense management platform. Odoo Hackathon 2026.

**Stack**: Node.js + Express + TypeScript + Prisma (backend) · React + Vite + TypeScript + Tailwind (frontend) · PostgreSQL 16 · Docker Compose

## Structure

```
transitops/
├── docker-compose.yml       # db + app services
├── Dockerfile.dev           # single dev image, runs backend+frontend together
├── package.json             # root — only `concurrently` dev dependency
├── .env.example             # copy to .env before running
├── backend/
│   ├── src/
│   │   ├── index.ts         # Express entrypoint
│   │   ├── modules/         # one folder per domain (vehicles, drivers, trips, ...)
│   │   ├── middleware/      # auth, rbac, error-handler
│   │   └── prisma/schema.prisma
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx, App.tsx
│   │   ├── pages/           # one per module
│   │   ├── components/
│   │   └── lib/api-client.ts
│   ├── package.json
│   └── vite.config.ts       # dev server :5173, proxies /api -> app:4000
└── docs/
    ├── screenshots/
    └── superpowers/specs/   # design docs
```

## Setup

```bash
cp .env.example .env
docker compose up --build
```

- Backend API: http://localhost:4000 (health check: `/health`)
- Frontend: http://localhost:5173
- Postgres: localhost:5432 (credentials in `.env`)

Backend and frontend run as two hot-reloading processes inside the same `app` container — edit `backend/src` or `frontend/src` on host, changes reflect immediately. Rebuild (`docker compose up --build`) only after changing a `package.json`.

`node_modules` for both live in named Docker volumes, not bind-mounted from host.
