# Incident Timeline & Root Cause Tracker

A full-stack internal tool for engineering teams to document production incidents end-to-end — from the first alert, through a timestamped timeline and supporting evidence, to a formal root cause analysis and tracked follow-up action items.

Built as an internship deliverable at Whitepulse Engineering.

---

## Features

- **Authentication** — JWT access + refresh tokens, silent refresh on the frontend, protected routes
- **Incident Management** — create, list, filter (by severity/status), and update incident status
- **Timeline** — chronological event log per incident, with create/edit
- **Evidence** — attach screenshots, logs, or notes to an incident, with optional file upload and delete
- **Root Cause Analysis (RCA)** — dedicated page per incident to document root cause, resolution, lessons learned, and contributing factors
- **Action Items** — track follow-up tasks per incident with owner, due date, and status
- **Dashboard** — open incident count, incidents by severity, mean resolution time, recently closed incidents

---

## Tech Stack

**Backend**
- NestJS + TypeScript
- MongoDB with Mongoose
- Passport + JWT (access & refresh tokens)
- Winston (logging), Joi (env validation)
- Jest (unit tests)

**Frontend**
- React + Vite
- Tailwind CSS
- Axios (with silent token refresh)
- React Router

**Infrastructure**
- Docker & Docker Compose
- nginx (serves frontend build, proxies /api to backend)

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── auth/            # JWT auth, login, register, refresh
│   │   ├── incidents/       # Core incident CRUD
│   │   ├── timeline/        # Timeline events
│   │   ├── evidence/        # Evidence upload/delete
│   │   ├── rca/             # Root cause analysis
│   │   ├── action-items/    # Follow-up action items
│   │   ├── dashboard/       # Aggregated stats
│   │   └── common/          # Global filters, interceptors
│   ├── test/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level components
│   │   ├── components/      # Shared UI (Modal, badges, layout)
│   │   ├── hooks/           # useApi, etc.
│   │   ├── context/         # AuthContext
│   │   ├── api/             # Axios instance
│   │   └── utils/           # Helpers, constants
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

---

## Getting Started

### Option A — Run with Docker (recommended)

**Prerequisites:** Docker Desktop, a running MongoDB instance (local or Atlas)

1. Copy the env template and fill in your secrets:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```
   JWT_SECRET=your-long-random-string
   JWT_REFRESH_SECRET=a-different-long-random-string
   ```

2. By default, the backend container connects to a MongoDB instance running on your host machine at localhost:27017 (via host.docker.internal). Make sure your local MongoDB is running before starting Docker.

   To use a different MongoDB (e.g. Atlas), edit the MONGO_URI value in docker-compose.yml under the backend service.

3. Build and start everything:
   ```bash
   docker-compose up --build
   ```

4. Open the app:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - Swagger docs (dev only): http://localhost:5000/api/docs

5. Stop everything:
   ```bash
   docker-compose down
   ```

### Option B — Run locally without Docker

**Prerequisites:** Node.js 20+, MongoDB running locally or an Atlas connection string

1. Install dependencies for both apps:
   ```bash
   npm run install:all
   ```

2. Create backend/.env:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/incident-tracker
   JWT_SECRET=your-long-random-string
   JWT_REFRESH_SECRET=a-different-long-random-string
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=30d
   CORS_ORIGIN=http://localhost:5173
   ```

3. Start the backend:
   ```bash
   npm run dev:backend
   ```

4. In a second terminal, start the frontend:
   ```bash
   npm run dev:frontend
   ```

5. Open http://localhost:5173

---

## Running Tests

```bash
npm run test:backend
```

77 unit tests across 14 suites covering auth, incidents, timeline, evidence, RCA, action items, and dashboard.

---

## API Overview

All routes are prefixed with /api and (except auth) require a Bearer token.

| Resource | Endpoints |
|---|---|
| Auth | POST /auth/register, POST /auth/login, POST /auth/refresh |
| Incidents | GET/POST /incidents, GET/PATCH /incidents/:id |
| Timeline | GET /timeline/:incidentId, POST /timeline, PATCH /timeline/:id |
| Evidence | GET /evidence/:incidentId, POST /evidence (multipart), DELETE /evidence/:id |
| RCA | GET /rca/:incidentId, POST /rca, PATCH /rca/:incidentId |
| Action Items | GET /action-items/:incidentId, POST /action-items, PATCH /action-items/:id |
| Dashboard | GET /dashboard |

> Note: POST endpoints for Timeline, RCA, and Action Items expect incidentId in the request body, not the URL.

Full interactive documentation is available via Swagger at /api/docs when running in development mode.

---

## Notes on Design Decisions

- RCA and Action Items are separate pages (/incidents/:id/rca, /incidents/:id/actions), while Timeline and Evidence are inline modals within the Incident Detail view — this reflects their relative complexity.
- Evidence supports create and delete only — there is no edit/update endpoint by design.
- Mongoose validation errors and MongoDB duplicate key errors are caught globally and returned as proper 400/409 responses instead of generic 500s.

---
