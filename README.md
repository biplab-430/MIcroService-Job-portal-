# 🏢 HireHeaven — Microservices Job Portal
**Live Demo:** [m-icro-service-job-portal.vercel.app](https://m-icro-service-job-portal.vercel.app)
> A **production-grade, full-stack job portal** built with a microservices architecture — featuring real-time follow-gated chat, AI-powered career tools, Kafka event streaming, Redis caching, MongoDB + PostgreSQL polyglot persistence, and a Next.js 16 frontend.

[![Node.js](https://img.shields.io/badge/Node.js-≥19-339933?logo=nodedotjs)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=nextdotjs)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)](https://neon.tech)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-Upstash-DC382D?logo=redis)](https://upstash.com)
[![Kafka](https://img.shields.io/badge/Kafka-KafkaJS-231F20?logo=apachekafka)](https://kafka.apache.org)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-010101?logo=socketdotio)](https://socket.io)

---

## 📑 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services At a Glance](#services-at-a-glance)
- [Tech Stack](#tech-stack)
- [Monorepo Structure](#monorepo-structure)
- [Quick Start](#quick-start)
- [Environment Variables — All Services](#environment-variables--all-services)
- [API Reference](#api-reference)
- [Database Design](#database-design)
- [Real-time System](#real-time-system)
- [AI Features](#ai-features)
- [Kafka Event Flow](#kafka-event-flow)
- [Inter-Service Communication Map](#inter-service-communication-map)
- [Why Microservices Over Monolith?](#why-microservices-over-monolith)
- [Polyglot Persistence](#polyglot-persistence)
- [Deployment](#deployment)
- [Docker Compose](#docker-compose)
- [Contributing](#contributing)
- [License](#license)

---

## Architecture Overview

HireHeaven is split into **5 independent backend microservices** and **1 Next.js frontend**, all communicating via REST, Kafka, and WebSockets.

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                           HireHeaven Platform                                  ║
║                                                                                ║
║  ┌──────────────────────────────────────────────────────────────────────────┐  ║
║  │              Frontend — Next.js 16 App Router  ( :3000 )                 │  ║
║  │                                                                          │  ║
║  │  /login  /register  /forgot  /reset  /job  /account/[id]  /company/[id] │  ║
║  │  /messages  /search  /followers  /following  /about                      │  ║
║  └──────┬───────────┬───────────┬────────────┬────────────┬─────────────────┘  ║
║         │REST        │REST        │REST         │REST         │REST + WebSocket  ║
║         ▼            ▼            ▼             ▼             ▼                  ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐         ║
║  │  Auth    │ │  User    │ │  Job     │ │  Utils   │ │  RealTime    │         ║
║  │ Service  │ │ Service  │ │ Service  │ │ Service  │ │  Service     │         ║
║  │  :5001   │ │  :5003   │ │  :5002   │ │  :5005   │ │   :5004      │         ║
║  │          │ │          │ │          │ │          │ │              │         ║
║  │ JWT auth │ │ Profiles │ │Companies │ │Cloudinary│ │ Socket.IO    │         ║
║  │ bcrypt   │ │ Skills   │ │ Jobs     │ │ Gemini   │ │ MongoDB chat │         ║
║  │ Kafka ▶  │ │ Follow   │ │ Apply    │ │ Puppeteer│ │ Redis cache  │         ║
║  │ Redis    │ │ graph    │ │ Kafka ▶  │ │ Kafka ◀  │ │              │         ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘         ║
║        │            │            │             │               │                ║
║        └────────────┴────────────┴─────────────┴───────────────┘                ║
║                                   │                                              ║
║              ┌────────────────────┼─────────────────────┐                       ║
║              ▼                    ▼                     ▼                        ║
║   ┌─────────────────┐  ┌────────────────┐  ┌───────────────────────────┐        ║
║   │  Neon PostgreSQL│  │ MongoDB Atlas  │  │   Apache Kafka            │        ║
║   │  (shared schema)│  │ (chat only)    │  │   topic: "send-mail"      │        ║
║   │                 │  │                │  │   Auth  ──▶ Utils ──▶ Gmail│        ║
║   │  users          │  │  conversations │  │   Job   ──▶ Utils ──▶ Gmail│        ║
║   │  skills         │  │  messages      │  └───────────────────────────┘        ║
║   │  user_skills    │  │  notifications │                                        ║
║   │  followers      │  └────────────────┘  ┌───────────────────────────┐        ║
║   │  companies      │                       │   Redis (Upstash TLS)     │        ║
║   │  jobs           │                       │   forgot:<email>  (15m)   │        ║
║   │  applications   │                       │   user_socket:<id>        │        ║
║   └─────────────────┘                       │   chat:<convId>  (50 msg) │        ║
║                                             └───────────────────────────┘        ║
╚══════════════════════════════════════════════════════════════════════════════════╝
```

---

## Services At a Glance

| Service | Port | Core Responsibility | Key Tech |
|---|---|---|---|
| **Auth Service** | 5000 | Register, login, JWT issuance, forgot/reset password | bcrypt, JWT, Kafka producer, Redis |
| **User Service** | 5003 | User profiles, skills, job applications, follow graph | Neon PostgreSQL, Axios → Utils |
| **Job Service** | 5002 | Companies, job postings, recruiter dashboards, application status | Neon PostgreSQL, Kafka producer |
| **Utils Service** | 5001 | File uploads, AI tools, email dispatch | Cloudinary, Gemini AI, Puppeteer, Nodemailer, Kafka consumer |
| **RealTime Service** | 5004 | Follow-gated real-time chat with presence and read receipts | Socket.IO, MongoDB Atlas, Redis, Neon PostgreSQL |
| **Frontend** | 3000 | Complete user interface | Next.js 16, React 19, Tailwind CSS, shadcn/ui, Socket.IO client |

For full per-service documentation see:
- [`backend/auth/README.md`](./backend/auth/README.md)
- [`backend/user/README.md`](./backend/user/README.md)
- [`backend/job/README.md`](./backend/job/README.md)
- [`backend/utilsService/README.md`](./backend/utilsService/README.md)
- [`backend/realtime/README.md`](./backend/realtime/README.md)
- [`frontend/README.md`](./frontend/README.md)

---

## Tech Stack

### Backend — All Services

| Category | Technology | Version | Used By |
|---|---|---|---|
| Runtime | Node.js | ≥ 19 | All |
| Language | TypeScript | 6.0 | All |
| Framework | Express | 5.2 | All |
| Primary DB | Neon PostgreSQL (`@neondatabase/serverless`) | 1.1 | Auth, User, Job, Utils, RealTime |
| Message DB | MongoDB Atlas (Mongoose) | 9.6 | RealTime |
| Cache | Redis (Upstash TLS) | 5.12 | Auth, RealTime |
| Message Broker | Apache Kafka (KafkaJS) | 2.2 | Auth, Job (produce) · Utils (consume) |
| Auth | jsonwebtoken | 9.0 | All |
| Password Hash | bcrypt | 6.0 | Auth |
| File Storage | Cloudinary | v2 | Utils (via Auth, User, Job upload relay) |
| AI Engine | Google Gemini 2.5 Flash (`@google/genai`) | 2.0 | Utils |
| PDF Engine | Puppeteer Core (headless Chrome) | 24 | Utils |
| Email | Nodemailer (Gmail SMTP port 465) | 8.0 | Utils |
| Real-time | Socket.IO | 4.8 | RealTime |
| File Parsing | Multer (memory storage) + DataURI | 2.1 | Auth, User, Job, Utils, RealTime |
| HTTP Client | Axios | 1.15+ | Auth, User, Job, RealTime → Utils |
| Dev server | Nodemon + Concurrently | 3.1 / 9.2 | All |

### Frontend

| Category | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Webpack mode) | 16.2.6 |
| UI Library | React + React DOM | 19.2 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 4 |
| Component Library | shadcn/ui (Radix UI primitives) | 4.7 |
| State Management | React Context API (AppContext + SocketContext) | — |
| HTTP Client | Axios | 1.16 |
| Auth Storage | js-cookie (JWT in browser cookie `"token"`) | 3.0 |
| Real-time | socket.io-client | 4.8 |
| Notifications | react-hot-toast | 2.6 |
| Icons | lucide-react | 1.14 |
| Theme | next-themes (dark/light/system) | 0.4 |
| Class Utilities | clsx + tailwind-merge | latest |

---

## Monorepo Structure

```
hireheaven/
│
├── backend/
│   │
│   ├── auth/                          # Auth Service (Port 5001)
│   │   ├── src/
│   │   │   ├── controllers/auth.ts    # register, login, forgotPassword, resetPassword
│   │   │   ├── middleware/multer.ts   # memory storage multer
│   │   │   ├── routes/auth.ts         # /api/auth/*
│   │   │   ├── utilis/
│   │   │   │   ├── buffer.ts          # DataURI converter
│   │   │   │   ├── db.ts              # Neon SQL client
│   │   │   │   ├── errorHandler.ts    # Custom error class
│   │   │   │   └── TryCatch.ts        # Async wrapper
│   │   │   ├── app.ts                 # Express app
│   │   │   ├── index.ts               # DB init + Redis connect + server
│   │   │   ├── producer.ts            # Kafka producer (send-mail topic)
│   │   │   └── template.ts            # Forgot password HTML email
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── user/                          # User Service (Port 5003)
│   │   ├── src/
│   │   │   ├── controller/user.ts     # profile, skills, apply, follow graph
│   │   │   ├── middleware/            # auth.ts, multer.ts
│   │   │   ├── routes/user.ts         # /api/user/*
│   │   │   ├── utilis/                # buffer, db, errorHandler, TryCatch
│   │   │   └── index.ts               # Express app + server
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── job/                           # Job Service (Port 5002)
│   │   ├── src/
│   │   │   ├── controller/job.ts      # company, job, application CRUD
│   │   │   ├── middleware/            # auth.ts, multer.ts
│   │   │   ├── routes/job.ts          # /api/jobs/*
│   │   │   ├── utilis/                # buffer, db, errorHandler, TryCatch
│   │   │   ├── app.ts
│   │   │   ├── index.ts               # DB init + Kafka + server
│   │   │   ├── producer.ts            # Kafka producer (send-mail topic)
│   │   │   └── template.ts            # Application status update email
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   ├── utilsService/                  # Utils Service (Port 5005)
│   │   ├── src/
│   │   │   ├── middleware/            # auth.ts (isAuth for AI routes)
│   │   │   ├── utilis/
│   │   │   │   ├── db.ts
│   │   │   │   └── generateResumeHTML.ts  # HTML template for Puppeteer
│   │   │   ├── consumer.ts            # Kafka consumer → Nodemailer
│   │   │   ├── index.ts               # Express + Cloudinary config + Kafka consumer start
│   │   │   └── routes.ts              # /upload /career /resume-analyser /create-resume /download-resume
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── realtime/                      # RealTime Service (Port 5004)
│       ├── src/
│       │   ├── config/
│       │   │   ├── FollowerCheck.ts   # PostgreSQL follow status query
│       │   │   ├── redis.ts           # Upstash TLS Redis client
│       │   │   └── socket.ts          # Socket.IO server + all real-time events
│       │   ├── controller/
│       │   │   ├── mes-con.ts         # sendMessage, getMessages, deleteMessage, etc.
│       │   │   └── not-con.ts         # notification controller
│       │   ├── middleware/            # auth.ts, multer.ts
│       │   ├── models/
│       │   │   ├── conversation.ts    # Mongoose Conversation schema
│       │   │   ├── message.ts         # Mongoose Message schema
│       │   │   └── notification.ts    # Mongoose Notification schema
│       │   ├── routes/                # message.ts, not.ts
│       │   ├── utils/                 # buffer, connectDb, db, errorHandler, TryCatch
│       │   ├── app.ts
│       │   └── index.ts               # HTTP server + Socket.IO + MongoDB connect
│       ├── Dockerfile
│       └── package.json
│
└── frontend/                          # Next.js 16 Frontend (Port 3000)
    ├── src/
    │   ├── app/
    │   │   ├── (auth)/
    │   │   │   ├── forgot/page.tsx
    │   │   │   ├── login/page.tsx
    │   │   │   ├── register/page.tsx
    │   │   │   └── reset/page.tsx
    │   │   ├── about/page.tsx
    │   │   ├── account/[id]/page.tsx
    │   │   ├── company/[id]/page.tsx
    │   │   ├── followers/page.tsx
    │   │   ├── following/page.tsx
    │   │   ├── job/page.tsx
    │   │   ├── messages/page.tsx
    │   │   ├── search/page.tsx
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   └── not-found.tsx
    │   ├── components/
    │   │   ├── messages/              # chat-area, conv-item, message-bubble,
    │   │   │                          # message-input, message-search,
    │   │   │                          # message-sidebar, StartChatButton, UniversalSearch
    │   │   ├── ui/                    # shadcn: alert-dialog, avatar, button, card,
    │   │   │                          # dialog, dropdown-menu, input, label,
    │   │   │                          # popover, textarea, tooltip
    │   │   ├── Applied-job.tsx
    │   │   ├── company.tsx
    │   │   ├── Follow-unfollow.tsx
    │   │   ├── info.tsx
    │   │   ├── skills.tsx
    │   │   ├── carrer-guide.tsx       # AI career path guide UI
    │   │   ├── hero.tsx
    │   │   ├── job-card.tsx
    │   │   ├── loading.tsx
    │   │   ├── mode-toggle.tsx
    │   │   ├── navbar.tsx
    │   │   ├── resume-analyzer.tsx    # ATS analyser UI
    │   │   ├── ResumeBuilder.tsx      # AI resume builder + download UI
    │   │   └── theme-provider.tsx
    │   ├── context/
    │   │   ├── AppContext.tsx          # Global state + all REST calls + service URLs
    │   │   └── socketContext.tsx       # Socket.IO lifecycle (connect on login, disconnect on logout)
    │   ├── lib/utils.ts               # cn() = clsx + tailwind-merge
    │   └── type.ts                    # All TypeScript interfaces
    ├── .env.local
    ├── next.config.ts
    ├── Dockerfile
    └── package.json
```

---

## Quick Start

### Prerequisites

| Requirement | Notes |
|---|---|
| Node.js ≥ 19 | All backend services require ≥ 19 |
| npm ≥ 9 | Or yarn / pnpm |
| Kafka broker | Local (Docker) or cloud (Confluent, Upstash) |
| Redis | Local (`redis-server`) or Upstash (use `rediss://` for TLS) |
| Neon account | Free tier sufficient — create one database, shared across all services |
| MongoDB Atlas account | Free M0 cluster |
| Cloudinary account | Free tier for file uploads |
| Google AI Studio key | For Gemini 2.5 Flash (AI features) |
| Gmail App Password | 2FA → App Passwords → generate one |
| Google Chrome | Required by Puppeteer for PDF generation |

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/hireheaven.git
cd hireheaven
```

### 2 — Configure environment variables

Copy each `.env.example` (or create `.env`) for every service. See the [Environment Variables](#environment-variables--all-services) section below.

> ⚠️ **Critical:** `JWT_SEC` must be **identical** across all 5 backend services. They each verify the same token independently.

### 3 — Start all backend services

Open 5 separate terminals:

```bash
# Terminal 1 — Auth Service
cd backend/auth && npm install && npx nodemon
# Running on http://localhost:5001
# Auto-creates PostgreSQL tables on first boot

# Terminal 2 — User Service
cd backend/user && npm install && npx nodemon
# Running on http://localhost:5003
# Shares the same Neon DB (no init needed)

# Terminal 3 — Job Service
cd backend/job && npm install && npx nodemon
# Running on http://localhost:5002
# Auto-creates companies, jobs, applications tables

# Terminal 4 — Utils Service
cd backend/utilsService && npm install && npx nodemon
# Running on http://localhost:5005
# Starts Kafka consumer for send-mail topic on boot

# Terminal 5 — RealTime Service
cd backend/realtime && npm install && npx nodemon
# Running on http://localhost:5004
# Connects to MongoDB Atlas on boot
```

### 4 — Start the frontend

```bash
cd frontend
npm install
# Create .env.local with local service URLs (see below)
npm run dev
# App running on http://localhost:3000
```

### 5 — First boot database setup

**Auth Service** auto-creates on first startup:
- ENUMs: `user_role` (`jobseeker`, `recruiter`)
- Tables: `users`, `skills`, `user_skills`, `followers`
- Indexes on `followers(follower_id)`, `followers(following_id)`

**Job Service** auto-creates on first startup:
- ENUMs: `job_type` (`Full-time`, `Part-time`, `Contract`, `Internship`), `work_location` (`Remote`, `On-site`, `Hybrid`), `application_status` (`Submitted`, `Hired`, `Rejected`)
- Tables: `companies`, `jobs`, `applications`

No manual SQL or migration commands needed.

---

## Environment Variables — All Services

### Auth Service — `backend/auth/.env`

```env
PORT=5001

# Neon PostgreSQL
DB_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Redis (local: redis://localhost:6379 | Upstash: rediss://...)
REDIS_URL=redis://localhost:6379

# Kafka
kafka_Broker=localhost:9092

# JWT — MUST match all other services
JWT_SEC=your_super_secret_jwt_key_change_this

# Internal service calls
UPLOAD_SERVICE=http://localhost:5005

# For password reset link in email
Frontend_url=http://localhost:3000
```

### User Service — `backend/user/.env`

```env
PORT=5003
DB_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
JWT_SEC=your_super_secret_jwt_key_change_this
UPLOAD_SERVICE=http://localhost:5005
```

### Job Service — `backend/job/.env`

```env
PORT=5002
DB_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require
kafka_Broker=localhost:9092
JWT_SEC=your_super_secret_jwt_key_change_this
UPLOAD_SERVICE=http://localhost:5005
```

### Utils Service — `backend/utilsService/.env`

```env
PORT=5005

# Neon PostgreSQL (for user data in /create-resume)
DB_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Cloudinary
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Google Gemini AI
API_KEY_GEMINI=your_gemini_api_key_from_aistudio

# Gmail SMTP (use App Password, NOT your account password)
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# Kafka
kafka_Broker=localhost:9092

# JWT (for isAuth middleware on /create-resume and /download-resume)
JWT_SEC=your_super_secret_jwt_key_change_this
```

### RealTime Service — `backend/realtime/.env`

```env
PORT=5004

# MongoDB Atlas
MONGO_DB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/?appName=YourApp

# Neon PostgreSQL (for follower checks and user profile lookups)
DB_URL=postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require

# Redis — MUST use rediss:// (TLS) for Upstash
REDIS_URL=rediss://default:<token>@<host>.upstash.io:6379

# JWT
JWT_SEC=your_super_secret_jwt_key_change_this

# Utils Service (for media uploads in chat)
UPLOAD_SERVICE=http://localhost:5005
```

### Frontend — `frontend/.env.local`

```env
# Local development
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:5001
NEXT_PUBLIC_USER_SERVICE=http://localhost:5003
NEXT_PUBLIC_JOB_SERVICE=http://localhost:5002
NEXT_PUBLIC_UTILS_SERVICE=http://localhost:5005
NEXT_PUBLIC_REALTIME_SERVICE=http://localhost:5004
```

```env
# Production (Render)
NEXT_PUBLIC_AUTH_SERVICE=https://auth-latest-a7tg.onrender.com
NEXT_PUBLIC_USER_SERVICE=https://user-latest-zrci.onrender.com
NEXT_PUBLIC_JOB_SERVICE=https://job-latest-eemi.onrender.com
NEXT_PUBLIC_UTILS_SERVICE=https://utilsservice-latest.onrender.com
NEXT_PUBLIC_REALTIME_SERVICE=https://realtime-latest-skhc.onrender.com
```

> All frontend variables **must** be prefixed with `NEXT_PUBLIC_` to be exposed in the browser bundle.

---

## API Reference

### Auth Service — Base: `/api/auth`

| Method | Endpoint | Auth | Body / Params | Description |
|---|---|---|---|---|
| POST | `/register` | ❌ | `multipart/form-data`: name, email, password, phoneNumber, role, bio?, file (resume for jobseeker) | Register new user. Jobseeker must upload resume. |
| POST | `/login` | ❌ | `{ email, password }` | Returns JWT + full user object with skills |
| POST | `/forgot` | ❌ | `{ email }` | Publishes reset email to Kafka → Gmail. Always returns same message (anti-enumeration) |
| POST | `/reset/:token` | ❌ | `{ password }` | Validates JWT reset token from Redis, hashes new password |

### User Service — Base: `/api/user`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/me` | ✅ | Own full profile (from `req.user` set by `isAuth`) |
| GET | `/:userId` | ✅ | Any user's profile with aggregated skills |
| PUT | `/updated/profile` | ✅ | Update name, phoneNumber, bio (partial — missing fields keep old value) |
| PUT | `/updated/pic` | ✅ `multipart` | Replace profile picture → Utils Service → Cloudinary |
| PUT | `/updated/resume` | ✅ `multipart` | Replace resume PDF → Utils Service → Cloudinary |
| POST | `/skill/add` | ✅ | Add skill (transactional upsert + idempotent link) |
| PUT | `/skill/delete` | ✅ | Remove skill + orphan cleanup |
| POST | `/apply/job` | ✅ | Apply for job (checks subscription for priority flag) |
| GET | `/application/all` | ✅ | All own applications with job title, salary, location joined |
| DELETE | `/delete/job/:id` | ✅ | Cancel application (blocked if status is `Hired`) |
| GET | `/data/search?query=` | ✅ | Search users by name or email (ILIKE, up to 20 results) |
| POST | `/follow/:userId` | ✅ | Follow a user (409 if already following) |
| DELETE | `/unfollow/:userId` | ✅ | Unfollow a user |
| GET | `/followers/:userId` | ✅ | Followers list + `isFollowing` boolean for current user |
| GET | `/following/:userId` | ✅ | Following list |
| DELETE | `/remove-follower/:userId` | ✅ | Force someone to unfollow you |

### Job Service — Base: `/api/jobs`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/company/new` | ✅ Recruiter `multipart` | Create company with logo upload |
| DELETE | `/company/:companyId` | ✅ Recruiter | Delete company + all jobs (CASCADE) |
| GET | `/company/all` | ✅ | All companies by the authenticated recruiter |
| GET | `/company/:id` | ❌ | Company details with embedded jobs (`json_agg`) |
| POST | `/company/job` | ✅ Recruiter | Post a new job (verifies company ownership) |
| PUT | `/company/job/:job_id` | ✅ Recruiter | Update job fields including `is_active` toggle |
| DELETE | `/company/job/delete/:jobId` | ✅ Recruiter | Delete job + cascade deletes applications |
| GET | `/job/all?title=&location=` | ❌ | Search active jobs with ILIKE filters, sorted by `created_at DESC` |
| GET | `/job/:jobId` | ❌ | Single job detail |
| GET | `/application/all/:jobId` | ✅ Recruiter | All applications for a job (ordered: `subscribed DESC, applied_at ASC`) |
| PUT | `/application/update/:id` | ✅ Recruiter | Update application status + publish Kafka email notification |

### Utils Service — Base: `/api/utilsService`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/upload` | ❌ Internal | Accept DataURI buffer + optional `public_id` (deletes old), upload to Cloudinary |
| POST | `/career` | ❌ | AI career path guide from skills string → Gemini JSON |
| POST | `/resume-analyser` | ❌ | ATS score + suggestions from PDF base64 → Gemini PDF vision |
| POST | `/create-resume` | ✅ | Build ATS-optimised resume JSON from user profile + form data using Gemini |
| POST | `/download-resume` | ✅ | Render resume JSON as HTML → Puppeteer → binary PDF download |

### RealTime Service — Base: `/api/chat`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/conversations` | ✅ | All conversations (batch PostgreSQL user query + Redis pipeline for online status) |
| GET | `/conversations/unread-badge` | ✅ | `{ unreadConversationsCount, totalUnreadMessages }` |
| PUT | `/conversations/mark-read` | ✅ | Reset unread count + bulk mark `seen` + emit `messages_seen` socket event |
| POST | `/conversations/:receiverId` | ✅ | Get or create conversation (participants sorted numerically) |
| DELETE | `/conversations/:conversationId/clear` | ✅ | Soft-delete all messages for current user + evict Redis cache |
| GET | `/search-conversations?searchQuery=` | ✅ | Search by other user's name or bio (PostgreSQL LIKE) |
| POST | `/messages` | ✅ `multipart` | Send message (follow-gate + one-way rule + Redis cache + Socket.IO delivery) |
| GET | `/get/messages?conversationId=&page=` | ✅ | Paginated messages (Redis-first → MongoDB fallback, 50 per page) |
| PUT | `/messages/:messageId` | ✅ | Edit text message (15-min window, own only, invalidates Redis cache) |
| DELETE | `/delete/messages/:messageId` | ✅ | Delete for me or delete for everyone (Redis cache eviction) |
| GET | `/messages/search?searchQuery=&conversationId=` | ✅ | MongoDB regex search across conversations |

---

## Database Design

### PostgreSQL (Neon) — Shared across Auth, User, Job, Utils, RealTime

```sql
-- ══════════════ ENUMS ══════════════

CREATE TYPE user_role          AS ENUM ('jobseeker', 'recruiter');
CREATE TYPE job_type           AS ENUM ('Full-time', 'Part-time', 'Contract', 'Internship');
CREATE TYPE work_location      AS ENUM ('Remote', 'On-site', 'Hybrid');
CREATE TYPE application_status AS ENUM ('Submitted', 'Hired', 'Rejected');


-- ══════════════ USERS ══════════════

CREATE TABLE users (
  user_id              SERIAL PRIMARY KEY,
  name                 VARCHAR(255)  NOT NULL,
  email                VARCHAR(255)  NOT NULL UNIQUE,
  password             VARCHAR(255)  NOT NULL,           -- bcrypt hash
  phone_number         VARCHAR(20)   NOT NULL,
  role                 user_role     NOT NULL,
  bio                  TEXT,
  resume               VARCHAR(255),                     -- Cloudinary URL
  resume_public_id     VARCHAR(255),
  profile_pic          VARCHAR(255),
  profile_pic_public_id VARCHAR(255),
  subscription         TIMESTAMPTZ,                       -- premium expiry
  created_at           TIMESTAMPTZ   DEFAULT CURRENT_TIMESTAMP
);


-- ══════════════ SKILLS ══════════════

CREATE TABLE skills (
  skill_id  SERIAL PRIMARY KEY,
  name      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE user_skills (
  user_id   INTEGER REFERENCES users(user_id)   ON DELETE CASCADE,
  skill_id  INTEGER REFERENCES skills(skill_id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);


-- ══════════════ SOCIAL GRAPH ══════════════

CREATE TABLE followers (
  follower_id  INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  following_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id != following_id)               -- no self-follows
);

CREATE INDEX idx_followers_follower_id  ON followers(follower_id);
CREATE INDEX idx_followers_following_id ON followers(following_id);


-- ══════════════ COMPANIES ══════════════

CREATE TABLE companies (
  company_id       SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT         NOT NULL,
  website          VARCHAR(255) NOT NULL,
  logo             VARCHAR(255) NOT NULL,             -- Cloudinary URL
  logo_public_id   VARCHAR(255) NOT NULL,
  recruiter_id     INTEGER      NOT NULL,             -- FK to users (cross-service)
  created_at       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ══════════════ JOBS ══════════════

CREATE TABLE jobs (
  job_id                   SERIAL PRIMARY KEY,
  title                    VARCHAR(255)   NOT NULL,
  description              TEXT           NOT NULL,
  salary                   NUMERIC(10,2),
  location                 VARCHAR(255)   NOT NULL,
  job_type                 job_type       NOT NULL,
  openings                 INTEGER        NOT NULL,
  role                     VARCHAR(255)   NOT NULL,
  work_location            work_location  NOT NULL,
  company_id               INTEGER        NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
  posted_by_recruiter_id   INTEGER        NOT NULL,
  is_active                BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at               TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- ══════════════ APPLICATIONS ══════════════

CREATE TABLE applications (
  application_id   SERIAL PRIMARY KEY,
  job_id           INTEGER            NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  applicant_id     INTEGER            NOT NULL,                        -- FK to users
  applicant_email  VARCHAR(255)       NOT NULL,                        -- stored for email
  status           application_status NOT NULL DEFAULT 'Submitted',
  resume           VARCHAR(255)       NOT NULL,                        -- Cloudinary URL
  applied_at       TIMESTAMP          NOT NULL DEFAULT CURRENT_TIMESTAMP,
  subscribed       BOOLEAN            NOT NULL DEFAULT FALSE,          -- premium priority flag
  UNIQUE (job_id, applicant_id)                                        -- one application per job
);
```

### MongoDB Atlas (Mongoose) — RealTime Service only

```typescript
// Conversation
{
  participants: [Number],          // sorted user_id integers [min, max]
  lastMessage: ObjectId,           // ref: Message — populated in getConversations
  unreadCount: Map<string, number>, // { "42": 3, "17": 0 }
  createdAt: Date,
  updatedAt: Date                  // used for conversation list sort order
}

// Indexes
conversationSchema.index({ participants: 1 })   // dedup + fast lookup

// Message
{
  conversationId: ObjectId,        // ref: Conversation — indexed
  senderId: Number,                // Neon user_id
  receiverId: Number,              // Neon user_id
  content: String,                 // "" for media messages; "This message was deleted" after deletion
  type: "text" | "image" | "document",
  mediaUrl?: String,               // Cloudinary URL for media
  status: "sent" | "delivered" | "seen",
  deletedForEveryone: Boolean,     // true = content replaced, visible to nobody
  deletedFor: [Number],            // user_ids who soft-deleted for themselves
  isEdited: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
messageSchema.index({ conversationId: 1, createdAt: -1 }) // paginated loading
messageSchema.index({ content: "text" })                   // full-text search
```

### Redis Key Patterns

| Key | Type | TTL | Service | Purpose |
|---|---|---|---|---|
| `forgot:<email>` | String | 15 minutes | Auth | Password reset token |
| `user_socket:<userId>` | String | Deleted on disconnect | RealTime | socket.id for routing messages |
| `chat:<conversationId>` | List | No TTL (evicted on mutation) | RealTime | Last 50 messages cache |

---

## Real-time System

The RealTime Service runs Socket.IO on a raw Node.js `http.Server` — not `app.listen()` — so WebSocket upgrades work correctly on the same port as the REST API.

### Connection

```javascript
// Client (frontend/src/context/socketContext.tsx)
const socket = io("http://localhost:5004", {
  query: { userId: "42" },
  transports: ["websocket"]
});
```

On connect, the server runs:
```typescript
await redisClient.set(`user_socket:${userId}`, socket.id);
socket.broadcast.emit("user_online", { userId });
```

On disconnect:
```typescript
await redisClient.del(`user_socket:${userId}`);
socket.broadcast.emit("user_offline", { userId });
```

### Socket Events — Complete Reference

#### Client → Server

| Event | Payload | Description |
|---|---|---|
| `typing` | `{ receiverId }` | Typing indicator — routed via Redis to receiver socket |
| `stop_typing` | `{ receiverId }` | Stop typing indicator |
| `mark_seen` | `{ messageId, senderId }` | Mark message as seen, notify sender |
| `disconnect` | — | Auto-fired by Socket.IO on connection drop |

#### Server → Client

| Event | Payload | When Fired |
|---|---|---|
| `receive_message` | Full message object | When new message sent — emitted to **both** sender and receiver |
| `message_delivered` | `{ messageId, conversationId }` | Sent to **sender** when receiver is online at send time |
| `message_seen` | `{ messageId, receiverId }` | Sent to **sender** when receiver fires `mark_seen` |
| `messages_seen` | `{ conversationId, seenBy }` | Sent to **sender** on bulk mark-read (blue ticks) |
| `typing` | `{ senderId }` | Forwarded from sender to receiver |
| `stop_typing` | `{ senderId }` | Forwarded from sender to receiver |
| `message_deleted` | `{ messageId, deleteType }` | Sent to receiver on "delete for everyone" |
| `message_edited` | `{ messageId, conversationId, newContent, isEdited }` | Sent to receiver on edit |
| `user_online` | `{ userId }` | Broadcast to all when user connects |
| `user_offline` | `{ userId }` | Broadcast to all when user disconnects |
| `global_unread_updated` | — | Tells both sender and receiver to refresh navbar badge |
| `chat_cleared` | `{ conversationId }` | Tells sender's other tabs to clear conversation view |

### Message Send Flow (Full)

```
POST /api/chat/messages
         │
         ▼
1. Verify JWT → get senderId
2. Check follow status via PostgreSQL (followers table)
   └── !iFollowThem → 403 "must follow user first"
3. Check one-way message rule
   └── !theyFollowMe AND conversation exists AND already sent → 403
4. Get or create Conversation (participants sorted: [min, max])
5. If req.file:
   Buffer → DataURI → POST Utils Service /upload → Cloudinary URL
   type = "image" | "document" based on MIME
6. Check Redis: user_socket:{receiverId}
   └── exists  → status = "delivered"
   └── missing → status = "sent"
7. Create Message in MongoDB
8. Update Conversation:
   - $set lastMessage = newMessage._id
   - $inc unreadCount.{receiverId} += 1
9. Redis: LPUSH chat:{conversationId} JSON(message)
          LTRIM chat:{conversationId} 0 49
10. Socket.IO:
    - to receiverSocket: emit "receive_message"
    - to receiverSocket: emit "global_unread_updated"
    - to senderSocket:   emit "receive_message"
    - if receiver online: to senderSocket emit "message_delivered"
11. Return 201 { success: true, message }
```

### Message Retrieval — Redis-First Strategy

```
GET /api/chat/get/messages?conversationId=X&page=1
         │
         ▼
1. LRANGE chat:X  start=(page-1)*50  end=start+49
2. cachedMessages.length === 50?
   └── YES → parse, filter deletedFor, reverse → return (source: "redis")
   └── NO  → MongoDB: find({ conversationId: X, deletedFor: { $ne: userId } })
                        .sort({ createdAt: -1 }).skip(skip).limit(50)
              → return (source: "mongodb")
```

### Follow-Gated Messaging Rules

```
Can I send a message?

Is receiver in my following list?
  NO  → 403 "you must follow the user first"
  YES → Does receiver follow me back?
           YES → No restrictions, send freely
           NO  → Have I already sent a message in this conversation?
                    YES → 403 "one message until they follow you back"
                    NO  → Allow this first message
```

---

## AI Features

All AI features are handled by the **Utils Service** using **Google Gemini 2.5 Flash**.

### Career Path Guide

**Endpoint:** `POST /api/utilsService/career`

**Input:** `{ "skills": "React, Node.js, PostgreSQL, Docker" }`

**Output:**
```json
{
  "summary": "Concise overview of skill set and general job title",
  "jobOptions": [
    { "title": "...", "responsibilities": "...", "why": "..." }
  ],
  "skillsToLearn": [
    {
      "category": "DevOps & Cloud",
      "skills": [{ "title": "...", "why": "...", "how": "..." }]
    }
  ],
  "learningApproach": [
    { "title": "How to Approach Learning", "points": ["..."] }
  ]
}
```

### ATS Resume Analyser

**Endpoint:** `POST /api/utilsService/resume-analyser`

**Input:** `{ "pdfBase64": "data:application/pdf;base64,..." }`

The PDF is sent directly as `inlineData` to Gemini — no temp file storage needed.

**Output:**
```json
{
  "atsScore": 82,
  "scoreBreakdown": {
    "formatting":  { "score": 90, "feedback": "..." },
    "keywords":    { "score": 75, "feedback": "..." },
    "structure":   { "score": 85, "feedback": "..." },
    "readability": { "score": 80, "feedback": "..." }
  },
  "suggestions": [
    { "category": "Keywords", "issue": "...", "recommendation": "...", "priority": "high" }
  ],
  "strengths": ["..."],
  "summary": "2-3 sentence ATS performance overview"
}
```

### AI Resume Builder

**Endpoint:** `POST /api/utilsService/create-resume` (authenticated)

The service auto-fetches `name`, `email`, `phone_number`, `bio` from the database for the authenticated user, then combines with form input.

**Prompt enforces:**
- XYZ formula on all experience/project bullet points ("Accomplished X as measured by Y, by doing Z")
- High-impact action verbs (Architected, Engineered, Orchestrated…)
- Quantified metrics and scale implied from context
- ATS-safe formatting with technical depth

**Output includes:**
```json
{
  "personalInfo": { ... },
  "summary": "...",
  "technicalSkills": { "languages": [], "frontend": [], "backendAndDatabases": [], "toolsAndArchitecture": [] },
  "experience": [{ "company": "", "role": "", "duration": "", "points": [] }],
  "projects": [{ "name": "", "techStack": "", "liveUrl": "", "repoUrl": "", "points": [] }],
  "education": [{ "institution": "", "degree": "", "duration": "", "score": "" }],
  "certificationsAndAchievements": [],
  "atsOptimization": {
    "keywordsIncluded": [],
    "estimatedATSScore": 88,
    "missingKeywordsToConsider": []
  }
}
```

### PDF Resume Download

**Endpoint:** `POST /api/utilsService/download-resume` (authenticated)

Takes the resume JSON from the builder, generates HTML with `generateResumeHTML()`, launches headless Chrome via Puppeteer, renders to A4 PDF (12mm margins), and streams the binary response.

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="john_doe_resume.pdf"
```

> ⚠️ **`executablePath`** is currently set to Windows Chrome path. Update for your environment:
> - Linux: `/usr/bin/google-chrome-stable`
> - macOS: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
> - Docker: Install Chromium in the Dockerfile

---

## Kafka Event Flow

HireHeaven uses Kafka for **asynchronous, decoupled email delivery**. The API response never waits for email — the publish is fire-and-forget with `.catch()` logging.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Kafka: topic "send-mail"                       │
│                                                                     │
│  PRODUCERS:                        CONSUMER:                        │
│                                                                     │
│  Auth Service ──────────────────→  Utils Service                   │
│  (forgot password)                 (mail-service-group)             │
│                                         │                           │
│  Job Service  ──────────────────→       │                           │
│  (application status update)            ▼                           │
│                                    Nodemailer                       │
│                                    Gmail SMTP :465 (SSL)            │
│                                         │                           │
│                                         ▼                           │
│                                    User's inbox ✉️                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Topic auto-creation:** Both Auth and Job Service admin clients check `admin.listTopics()` on startup and create `send-mail` (1 partition, replication factor 1) if it doesn't exist.

**Message schema:**
```json
{
  "to": "user@example.com",
  "subject": "Reset Your Password - hireheaven",
  "html": "<html>...</html>"
}
```

**Email templates:**
| Trigger | Template | Key Content |
|---|---|---|
| `POST /api/auth/forgot` | `forgotPasswordTemplate(resetLink)` | Purple gradient header, reset button, 15-min expiry warning |
| `PUT /api/jobs/application/update/:id` | `applicationStatusUpdateTemplate(jobTitle)` | Application status update for job title |

---

## Inter-Service Communication Map

```
Frontend (Next.js :3000)
  │
  ├─── Register / Login / Forgot / Reset ─────────────────→ Auth Service (:5001)
  │                                                               │
  │                                                        Kafka "send-mail"
  │                                                               ↓
  ├─── Profile / Skills / Apply / Follow ─────────────────→ User Service (:5003)
  │         │                                                      │
  │         └── Profile pic / Resume upload ───────────────→ Utils Service (:5005)
  │                                                               │
  │                                                          Cloudinary
  │
  ├─── Jobs / Companies / Applications ───────────────────→ Job Service (:5002)
  │         │                                                      │
  │         └── Company logo upload ──────────────────────→ Utils Service (:5005)
  │                                                               │
  │                                                         Kafka "send-mail"
  │                                                               ↓
  ├─── AI Career / ATS / Resume / PDF ────────────────────→ Utils Service (:5005)
  │                                                               │
  │                                                     Gemini AI / Puppeteer
  │
  └─── Real-time Chat (REST + WebSocket) ─────────────────→ RealTime Service (:5004)
            │                                                      │
            │                                          ┌───────────┴──────────────┐
            │                                          │                          │
            │                                   MongoDB Atlas              Neon PostgreSQL
            │                                   (messages)                (follower checks
            │                                                             + user profiles)
            └─────────────────────── Redis (Upstash) ───┘
                                    (presence + cache)

Internal service-to-service calls (not through frontend):
  Auth Service  ──── Axios POST ──→ Utils Service  (resume upload on register)
  User Service  ──── Axios POST ──→ Utils Service  (profile pic / resume upload)
  Job Service   ──── Axios POST ──→ Utils Service  (company logo upload)
  RealTime      ──── Axios POST ──→ Utils Service  (chat media upload)
```

---

## Why Microservices Over Monolith?

This project was deliberately built as a microservices architecture. Here is the reasoning:

### Independent Deployability

Each service can be deployed, restarted, or scaled without touching the others. If the AI resume feature in Utils Service has a bug, recruiters can still post jobs and job seekers can still chat. In a monolith, one crash takes down everything.

```
Monolith failure:    [Auth + Jobs + Chat + AI + Uploads] ← one process dies
                      ALL features unavailable

Microservice failure: [Auth ✅] [Jobs ✅] [Chat ✅] [AI ❌] [Uploads ✅]
                                                       ↑
                                           only AI tools affected,
                                           everything else keeps running
```

### Independent Scaling

Different parts of this application have different load profiles:

| Service | Load Pattern | Reason |
|---|---|---|
| **RealTime Service** | High, sustained (WebSocket connections) | Every active user holds a persistent socket connection |
| **Job Service** | Spiky (search peaks in business hours) | Browse/apply traffic is bursty |
| **Utils Service** | CPU-intensive bursts | Puppeteer launches Chrome; Gemini has cold starts |
| **Auth Service** | Low, infrequent | Login/register happen rarely per user |

With a monolith you scale all features together even when only one is under load, wasting resources. With microservices you scale precisely where needed.

### Technology Freedom

Each service uses the right tool for its job. The RealTime Service needs MongoDB for flexible document arrays and Socket.IO for WebSocket management. The Auth Service needs PostgreSQL for relational integrity and transactions. You cannot make these per-feature choices in a monolith — you pick one stack and live with it everywhere.

### Domain Isolation

Each service has a clear, single responsibility with a defined HTTP contract. A developer working on the AI resume feature in Utils Service cannot accidentally break the follow/unfollow logic in User Service. The isolation is enforced by the network, not by naming conventions or code review discipline.

### Fault Tolerance via Kafka

Email delivery is decoupled through Kafka. A temporary Gmail SMTP outage does not cause `POST /register` or application status updates to fail. The event is published and the consumer retries when the SMTP recovers. In a monolith these operations are tightly coupled in a single request-response cycle.

### The Tradeoffs We Made

Microservices are not free. This architecture has real costs:

- **Shared JWT secret** — All 5 services share `JWT_SEC`. Rotating it requires redeploying all services simultaneously.
- **Shared database** — For pragmatic simplicity, all services share one Neon PostgreSQL database instead of database-per-service. True microservices use separate databases; that adds operational overhead not justified at this scale.
- **Local dev complexity** — 5 terminal windows instead of 1. Docker Compose reduces this to one command.
- **Distributed debugging** — One user action (e.g. applying for a job) can touch User Service, Job Service, and trigger a Kafka event to Utils Service. Tracing bugs requires checking logs across multiple processes.

For a project at this scale, the benefits — independent deployment, technology choice, fault isolation, clear ownership — outweigh the coordination cost.

---

## Polyglot Persistence

HireHeaven uses **three different databases** and **one cache** — each chosen for the data it stores. This is polyglot persistence: matching the storage technology to the data's access pattern rather than forcing everything into one tool.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Data Storage Strategy                                │
│                                                                              │
│  PostgreSQL (Neon)          MongoDB Atlas            Redis (Upstash)         │
│  ─────────────────          ─────────────            ──────────────────      │
│  Relational + ACID          Document store           In-memory, TTL          │
│  Strong consistency         Flexible schema          Ephemeral state         │
│  Foreign key integrity      Array-native ops         O(1) reads/writes       │
│                                                                              │
│  users                      conversations            user_socket:<id>        │
│  skills                     messages                 chat:<conversationId>   │
│  user_skills                notifications            forgot:<email>          │
│  followers                                                                   │
│  companies                                                                   │
│  jobs                                                                        │
│  applications                                                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

### PostgreSQL — Why SQL for relational data

User profiles, job listings, applications, companies, and the follow graph are all **highly relational**. A job application references a job, which references a company, which references a recruiter user. This chain of foreign keys with referential integrity is PostgreSQL's core strength.

The `UNIQUE(job_id, applicant_id)` constraint prevents duplicate applications at the database level — not in application code. The `user_role` ENUM ensures an invalid role can never be stored. The skill management transaction (`BEGIN / COMMIT / ROLLBACK`) wraps three SQL statements atomically so a skill insert never leaves the database in a partial state.

These guarantees would require significant application-level code to replicate in MongoDB.

**Why Neon specifically:** Neon is serverless PostgreSQL — it scales to zero when idle (critical for keeping costs low on a deployed project), supports connection pooling via its serverless driver, and is a standard PostgreSQL instance so `@neondatabase/serverless` works as a drop-in for `pg`.

### MongoDB Atlas — Why document DB for chat

Chat messages have a fundamentally different access pattern from relational data:

- Messages are always read in **bulk by `conversationId`** (50 at a time, paginated) — never individually joined to other tables
- `deletedFor` is an **array of user IDs** that grows dynamically. In SQL this would require a separate `message_deletions` table. In MongoDB it is a native array field with `$push` / `$ne` operators
- `unreadCount` in Conversation is a **`Map<userId, number>`** — a dynamic map that fits naturally in a MongoDB document. In SQL this would require a separate `conversation_unread` table
- `$set`, `$push`, `$inc` — MongoDB's partial update operators are purpose-built for the "update one field without rewriting the whole document" pattern that chat requires on every message status change
- Message type (`text` / `image` / `document`) means some messages have a `mediaUrl` field and others do not. In SQL this is nullable columns. In MongoDB it is simply an absent field — the schema is flexible by design

The compound index `{ conversationId: 1, createdAt: -1 }` makes paginated chat loading efficient. The text index `{ content: "text" }` enables full-text search across messages.

### Redis — Why in-memory for ephemeral state

Redis serves two genuinely different purposes in this system, both of which match its core properties perfectly:

**Password reset tokens (Auth Service)**

A reset token needs to exist for exactly 15 minutes and then vanish automatically. Redis TTL (`EX: 900`) makes this a native feature. There is no cron job, no cleanup query, no `WHERE expires_at < NOW()` sweep needed. Storing this in PostgreSQL would require a scheduled task or a per-request expiry check.

**Socket presence (RealTime Service)**

`user_socket:<userId> → socket.id` is read on every single message send to route the delivery to the correct WebSocket connection. This data must be:
- Read instantly (O(1) — Redis GET)
- Deleted immediately on disconnect (O(1) — Redis DEL)
- Not persisted — if the server restarts, all sockets disconnect and all presence state correctly disappears

Redis is the ideal fit. PostgreSQL would add table overhead and lock contention for a key that is deleted and recreated hundreds of times per minute at scale.

**Message cache (RealTime Service)**

The last 50 messages per conversation are cached in a Redis List. The vast majority of chat opens show only the most recent messages — this cache serves those requests entirely from memory without a MongoDB query. The cache is invalidated (`DEL`) on any mutation (edit, delete, clear) to ensure consistency. This is a standard **read-through cache with write invalidation** pattern.

### Why Not One Database for Everything?

Forcing all data into MongoDB would mean rebuilding foreign key integrity, ACID transactions, and complex multi-table JOINs in application code — all things PostgreSQL provides natively and reliably.

Forcing everything into PostgreSQL would mean storing chat messages as rows in a `messages` table, making the `deletedFor` array a separate table, making `unreadCount` a separate table, and losing MongoDB's expressive document update operators. The chat schema would become several JOIN-heavy tables for data that is fundamentally document-shaped.

Adding Redis as a pure cache on top of one database does not change the fundamental mismatch between the relational model and document-shaped chat data.

Each database in this system handles data that is structurally suited to its model:
- **Structured, relational, transactional → PostgreSQL**
- **Document-oriented, flexible schema, bulk-read → MongoDB**
- **Ephemeral, in-memory speed, TTL → Redis**

---

## Deployment

All services are deployed independently on **Render** (free tier). Each backend service has a `Dockerfile` and can be deployed as a Docker container.

| Service | Render URL |
|---|---|
| Auth | `https://auth-latest-a7tg.onrender.com` |
| User | `https://user-latest-zrci.onrender.com` |
| Job | `https://job-latest-eemi.onrender.com` |
| Utils | `https://utilsservice-latest.onrender.com` |
| RealTime | `https://realtime-latest-skhc.onrender.com` |

**Managed cloud services:**

| Service | Provider | Notes |
|---|---|---|
| PostgreSQL | Neon | Serverless, scales to zero |
| MongoDB | Atlas | Free M0 cluster |
| Redis | Upstash | Serverless Redis, TLS (`rediss://`) |
| File Storage | Cloudinary | Free tier for media |
| AI | Google AI Studio | Gemini 2.5 Flash |
| Email | Gmail SMTP | App Password required |

### Per-Service Docker Build

```bash
# Auth Service
cd backend/auth
docker build -t hireheaven-auth .
docker run -p 5001:5001 --env-file .env hireheaven-auth

# User Service
cd backend/user
docker build -t hireheaven-user .
docker run -p 5003:5003 --env-file .env hireheaven-user

# Job Service
cd backend/job
docker build -t hireheaven-job .
docker run -p 5002:5002 --env-file .env hireheaven-job

# Utils Service
cd backend/utilsService
docker build -t hireheaven-utils .
docker run -p 5005:5005 --env-file .env hireheaven-utils

# RealTime Service
cd backend/realtime
docker build -t hireheaven-realtime .
docker run -p 5004:5004 --env-file .env hireheaven-realtime

# Frontend
cd frontend
docker build -t hireheaven-frontend .
docker run -p 3000:3000 --env-file .env.local hireheaven-frontend
```

---

## Docker Compose

Start the entire platform with a single command:

```yaml
# docker-compose.yml (place at monorepo root)
version: "3.9"

services:

  auth:
    build: ./backend/auth
    ports:
      - "5001:5001"
    env_file: ./backend/auth/.env
    restart: unless-stopped

  user:
    build: ./backend/user
    ports:
      - "5003:5003"
    env_file: ./backend/user/.env
    restart: unless-stopped
    depends_on:
      - auth        # shares same DB, auth creates tables first

  job:
    build: ./backend/job
    ports:
      - "5002:5002"
    env_file: ./backend/job/.env
    restart: unless-stopped

  utils:
    build: ./backend/utilsService
    ports:
      - "5005:5005"
    env_file: ./backend/utilsService/.env
    restart: unless-stopped

  realtime:
    build: ./backend/realtime
    ports:
      - "5004:5004"
    env_file: ./backend/realtime/.env
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: ./frontend/.env.local
    restart: unless-stopped
    depends_on:
      - auth
      - user
      - job
      - utils
      - realtime
```

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up --build -d

# View logs
docker-compose logs -f realtime

# Stop everything
docker-compose down
```

> **Note on Puppeteer in Docker:** The Utils Service requires Chromium for PDF generation. Add this to `backend/utilsService/Dockerfile`:
> ```dockerfile
> FROM node:20-alpine
> RUN apk add --no-cache chromium
> ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
> WORKDIR /app
> COPY package*.json ./
> RUN npm install
> COPY . .
> RUN npx tsc
> EXPOSE 5005
> CMD ["node", "dist/index.js"]
> ```
> Then update `executablePath` in `routes.ts` to `/usr/bin/chromium-browser`.

---

## Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/your-feature-name`
3. **Work** in the relevant service folder only — cross-service changes should be minimal and deliberate
4. **Test** locally by running all 5 backend services and the frontend simultaneously
5. **Submit** a pull request with a clear description of what changed and why

**Code conventions across all services:**

- All controllers wrapped in `TryCatch` utility (no try/catch boilerplate in controllers)
- Custom `ErrorHandler` class for typed HTTP errors
- PostgreSQL queries use tagged template literals (`sql`...``) from `@neondatabase/serverless` — no string concatenation
- Dynamic SQL (e.g. `getAllActiveJobs` filters) uses parameterised `sql.query(string, values[])` — no string interpolation
- Multer always uses memory storage — no files written to disk
- Files are always uploaded via Utils Service — never directly to Cloudinary from Auth/User/Job/RealTime
- JWT is verified independently in each service — no Auth Service call on every request

**Service is independently deployable** — changes to one service do not require redeploying others, as long as the documented API contract is maintained.

---

## License

MIT © 2025 HireHeaven
