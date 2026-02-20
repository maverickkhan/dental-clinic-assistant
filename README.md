# Dental Clinic Patient Assistant

An AI-powered patient assistant dashboard for dental clinics, featuring real-time chat with Google Gemini AI, patient management, and comprehensive healthcare data tracking.

**Assessment Submission for Teraleads - Senior Full-Stack Engineer Position**

---

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://dental-clinic-assistant-frontend.vercel.app |
| **Backend API** | https://dental-clinic-backend-xs05.onrender.com |
| **AI Service** | https://dental-clinic-ai-nhb7.onrender.com |
| **API Health Check** | https://dental-clinic-backend-xs05.onrender.com/api/v1/health |
| **GitHub Repository** | https://github.com/maverickkhan/dental-clinic-assistant |

**Demo Credentials:**
- Email: `admin@dentalclinic.com`
- Password: `Admin123!@#`

> **Note:** Free tier services may take 30-60 seconds to wake up on first request.

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 15+
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/maverickkhan/dental-clinic-assistant.git
cd dental-clinic-assistant

# Install dependencies (monorepo)
npm install

# Set up environment variables
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
cp packages/ai-service/.env.example packages/ai-service/.env

# Set up Python virtual environment for AI service
cd packages/ai-service
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ../..

# Set up database
cd packages/backend
npx prisma generate
npx prisma migrate deploy
npm run db:seed  # Optional: seed with sample data
cd ../..
```

### Running Locally

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend

# Terminal 3 - AI Service
cd packages/ai-service
source venv/bin/activate
uvicorn main:app --reload --port 8001
```

Access the application:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **AI Service:** http://localhost:8001

---

## Environment Variables

### `packages/backend/.env`
```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/dental_clinic
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long
JWT_EXPIRES_IN=7d
AI_SERVICE_URL=http://localhost:8001
FRONTEND_URL=http://localhost:5173
```

### `packages/frontend/.env`
```env
VITE_API_BASE_URL=http://localhost:8080
```

### `packages/ai-service/.env`
```env
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash
PORT=8001
```

---

## Architecture Overview

```
                    +---------------------+
                    |   React Frontend    |
                    |  Vercel (CDN/SSR)   |
                    +----------+----------+
                               | REST API + JWT
                               v
                    +----------+----------+
                    |  Express.js Backend |
                    |   Render (Docker)   |
                    +----+----------+-----+
                         |          |
                         v          v
                +--------+--+  +---+-----------+
                | PostgreSQL |  | Python AI     |
                | Supabase   |  | Render(Docker)|
                +------------+  +-------+-------+
                                        |
                                        v
                                +-------+-------+
                                |  Gemini API   |
                                +---------------+
```

### Monorepo Structure

```
dental-clinic-assistant/
+-- packages/
|   +-- backend/          # Express.js API (TypeScript)
|   +-- frontend/         # React SPA (TypeScript + Vite)
|   +-- ai-service/       # Python FastAPI microservice
|   +-- shared/           # Shared types & Zod validation schemas
+-- DESIGN.md             # Architecture & design document
+-- README.md             # This file
+-- render.yaml           # Render Blueprint for deployment
```

### Key Architecture Decisions

| Decision | Why | Trade-off |
|----------|-----|-----------|
| Monorepo (npm workspaces) | Shared types, single source of truth | Complex setup, simpler maintenance |
| Prisma ORM | Type-safe queries, no SQL injection | Learning curve, prevents entire bug classes |
| Python AI microservice | Best AI ecosystem, independent scaling | Extra service to deploy |
| JWT authentication | Stateless, horizontally scalable | Cannot revoke tokens |
| Gemini 2.5 Flash | 90% cheaper than GPT-4, fast | Slightly lower quality |

---

## Features

### Authentication & Authorization
- JWT-based register/login with bcrypt (12 rounds)
- Strong password requirements (12+ chars, complexity)
- Protected routes with auth middleware
- Row-level authorization (users only see their own data)

### Patient Management (CRUD)
- Create, read, update, delete patients
- Paginated listing with configurable page size
- Fields: Name, Email, Phone, DOB, Medical Notes, createdAt, updatedAt
- Client-side and server-side Zod validation

### AI-Powered Chat
- Real-time chat interface per patient
- Google Gemini 2.5 Flash integration via Python microservice
- Patient context injected into AI prompts (name, medical notes)
- Emergency keyword detection
- Conversation history persistence in PostgreSQL
- Word-by-word streaming animation

### Security
- Rate limiting: global (100/15min), auth (5/15min), chat (20/15min)
- CORS with whitelisted origins
- Security headers via Helmet.js
- Input validation on all endpoints (Zod)
- SQL injection protection (Prisma parameterized queries)

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, React Hook Form, Zod |
| Backend | Express.js, TypeScript, Prisma ORM, JWT, bcrypt, Helmet |
| AI Service | Python 3.11, FastAPI, Google Gemini SDK, Pydantic v2 |
| Database | PostgreSQL 15+ (Supabase hosted) |
| Deployment | Vercel (frontend), Render (backend + AI, Docker), Supabase (DB) |

---

## Deployment

Both backend and AI services are deployed via Docker on Render using the `render.yaml` blueprint.

### Deployment Order
1. **Database** (Supabase) - Get connection string
2. **AI Service** (Render) - Get AI service URL
3. **Backend** (Render) - Set DATABASE_URL, AI_SERVICE_URL, FRONTEND_URL
4. **Frontend** (Vercel) - Set VITE_API_BASE_URL to backend URL
5. **Update CORS** - Set FRONTEND_URL in backend env vars

### Verification

```bash
# Backend health
curl https://dental-clinic-backend-xs05.onrender.com/api/v1/health

# AI service health
curl https://dental-clinic-ai-nhb7.onrender.com/health

# Frontend
open https://dental-clinic-assistant-frontend.vercel.app
```

---

## Design Document

See [DESIGN.md](./DESIGN.md) for the full design document covering:
- Database schema design & indexing strategy
- Authentication & security architecture
- AI service design & prompt engineering
- Scaling considerations & trade-offs

---

## AI Usage Disclosure

**Required by Assessment:** Full transparency on AI tool usage.

### AI Tools Used
1. **Claude AI (Anthropic)** - Architecture planning, code generation, debugging, deployment
2. **Google Gemini API** - Production AI service for patient chat

### AI-Assisted Components (~60% of codebase)
- Project scaffolding and monorepo setup
- Database schema and Prisma configuration
- Zod validation schemas (shared package)
- CRUD boilerplate (controllers, services, repositories)
- React components and TailwindCSS styling
- Docker and deployment configuration
- Documentation (README, DESIGN.md)

### Developer-Driven (~40%)
- Overall architecture decisions and trade-offs
- Business logic and data flow design
- AI prompt engineering and context injection
- Security implementation (rate limiting, CORS, auth flow)
- Database indexing strategy
- State management approach (Context API + hooks)
- Debugging: ESM module resolution, Prisma 7 adapter config, Docker multi-stage builds
- Production deployment troubleshooting

### Developer Can Fully Explain
- Why monorepo with shared types over multi-repo
- JWT token flow and security implications
- Database indexing choices for pagination queries
- Why Python microservice for AI vs embedded in Node
- Prisma ORM vs raw SQL trade-offs
- React Context API vs Redux for this scale
- Rate limiting strategy (three-tier)
- AI cost optimization (Gemini Flash, history truncation)
- Scaling bottlenecks and mitigation paths

---

## Known Limitations

### Security (Documented, acceptable for MVP)
- JWT stored in localStorage (migrate to httpOnly cookies in v2)
- No refresh token rotation (long-lived tokens)
- No email verification or password reset

### Performance (Acceptable for demo)
- Free tier services sleep after 15min inactivity
- Single database instance (scale with read replicas)
- In-memory rate limiting (add Redis for multi-instance)

---

## Scripts

```bash
# Root
npm install              # Install all workspace dependencies
npm run dev:backend      # Start backend dev server
npm run dev:frontend     # Start frontend dev server

# Backend (packages/backend/)
npm run dev              # Dev server with hot reload
npm run build            # TypeScript compilation
npm start                # Production server
npm run db:generate      # Generate Prisma client
npm run db:seed          # Seed database

# Frontend (packages/frontend/)
npm run dev              # Vite dev server
npm run build            # Production build

# AI Service (packages/ai-service/)
uvicorn main:app --reload        # Dev server
uvicorn main:app --host 0.0.0.0  # Production
```

---

**Author:** Maverick Khan
**Date:** February 2026
**Position:** Senior Full-Stack Engineer Assessment - Teraleads
