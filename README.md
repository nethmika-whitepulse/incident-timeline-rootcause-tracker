# Incident Timeline & Root Cause Tracker

A platform for engineering teams to document production incidents, build event timelines, collect evidence, perform root cause analysis (RCA), and track follow-up action items.

---

## Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Backend   | NestJS · TypeScript · MongoDB · Mongoose        |
| Auth      | JWT · Passport · bcryptjs                       |
| Uploads   | Multer (file evidence)                          |
| Logging   | Winston via nest-winston                        |
| API Docs  | Swagger (auto-generated at `/api/docs`)         |
| Testing   | Jest · ts-jest · Supertest · @nestjs/testing    |
| Frontend  | React · Vite · Tailwind CSS · Axios             |

---

## Project Structure

```
incident-tracker/
├── package.json               # Root monorepo scripts
├── backend/
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   ├── .env.example           # Copy to .env and fill in values
│   ├── test/
│   │   └── jest-e2e.json      # E2E test config
│   └── src/
│       ├── main.ts            # App bootstrap
│       ├── app.module.ts      # Root module
│       ├── auth/              # Register, login, JWT strategy
│       ├── incidents/         # Incident CRUD + schemas
│       ├── timeline/          # Timeline events
│       ├── evidence/          # File uploads + notes
│       ├── rca/               # Root cause analysis
│       ├── action-items/      # Follow-up tasks
│       ├── dashboard/         # Aggregated metrics
│       └── common/
│           ├── guards/        # JwtAuthGuard
│           ├── filters/       # Global exception filter
│           └── interceptors/  # Request logging interceptor
└── frontend/
    └── src/
        ├── App.jsx
        ├── api/axios.js       # Axios instance + interceptors
        ├── context/           # AuthContext
        ├── components/        # Layout, Badges, ProtectedRoute
        ├── pages/             # Dashboard, Incidents, RCA, etc.
        └── utils/helpers.js
```

---

## Getting Started

### 1. Install dependencies

```bash
npm run install:all
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
# Fill in MONGO_URI and JWT_SECRET
```

### 3. Run in development

```bash
# Backend (http://localhost:5000)
npm run dev:backend

# Frontend (http://localhost:5173)
npm run dev:frontend
```

### 4. API Documentation

Swagger UI is available at `http://localhost:5000/api/docs` when `NODE_ENV=development`.

### 5. Run tests

```bash
npm run test:backend    # 27 unit tests
```

---

## API Endpoints

| Method | Route                        | Description                  | Auth |
|--------|------------------------------|------------------------------|------|
| POST   | /api/auth/register           | Register a new user          | No   |
| POST   | /api/auth/login              | Login, receive JWT           | No   |
| GET    | /api/incidents               | List all incidents           | Yes  |
| POST   | /api/incidents               | Create incident              | Yes  |
| GET    | /api/incidents/:id           | Get single incident          | Yes  |
| PATCH  | /api/incidents/:id           | Update incident              | Yes  |
| DELETE | /api/incidents/:id           | Delete incident              | Yes  |
| POST   | /api/timeline                | Add timeline event           | Yes  |
| GET    | /api/timeline/:incidentId    | Get events (chronological)   | Yes  |
| PATCH  | /api/timeline/:id            | Update timeline event        | Yes  |
| DELETE | /api/timeline/:id            | Delete timeline event        | Yes  |
| POST   | /api/evidence                | Upload evidence / add note   | Yes  |
| GET    | /api/evidence/:incidentId    | List evidence for incident   | Yes  |
| DELETE | /api/evidence/:id            | Delete evidence              | Yes  |
| POST   | /api/rca                     | Create RCA document          | Yes  |
| GET    | /api/rca/:incidentId         | Get RCA for incident         | Yes  |
| PATCH  | /api/rca/:incidentId         | Update RCA                   | Yes  |
| POST   | /api/action-items            | Create action item           | Yes  |
| GET    | /api/action-items/:incidentId| List action items            | Yes  |
| PATCH  | /api/action-items/:id        | Update action item           | Yes  |
| DELETE | /api/action-items/:id        | Delete action item           | Yes  |
| GET    | /api/dashboard               | Get dashboard summary        | Yes  |
