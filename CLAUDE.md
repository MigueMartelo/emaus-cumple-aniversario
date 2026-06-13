# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Birthday and anniversary tracker for the Emaús Parejas community. Displays daily celebrations and provides admin tools for managing member records.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript (via tsx)
- Database: PostgreSQL 16
- Image Storage: Cloudinary
- Form Handling: react-hook-form

## Common Commands

### Initial Setup
```bash
# Start PostgreSQL in Docker
docker compose up -d

# Install all dependencies
npm run install:all

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure Cloudinary credentials in backend/.env
# CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
```

### Development
```bash
# Run backend (default port 4000)
npm run dev:backend

# Run frontend (default port 5173)
npm run dev:frontend

# Type checking
npm run typecheck --prefix backend
npm run typecheck --prefix frontend

# Build frontend for production
npm run build --prefix frontend
```

### Database
PostgreSQL runs on port **5433** (not the default 5432) to avoid conflicts.
- Connection: `postgres://community:community@127.0.0.1:5433/community_dates`
- Schema migrations run automatically on server start via `runMigrations()` in backend/src/db.ts
- Schema file: backend/src/schema.sql

## Architecture

### Backend Structure (backend/src/)

**Core Files:**
- `server.ts` - Express app setup, routes, error handling, graceful shutdown
- `db.ts` - PostgreSQL connection pool and migration runner
- `peopleRepository.ts` - Database queries for CRUD operations and celebration lookups
- `config.ts` - Environment variable parsing with validation via `requireConfig()`

**Key Modules:**
- `validation.ts` - Server-side validation for person data (names, dates)
- `uploads.ts` - Multer configuration for photo uploads (15 MB limit)
- `cloudinary.ts` - Image upload to Cloudinary with optimizations
- `dateUtils.ts` - Timezone-aware date parsing (uses `APP_TIME_ZONE` from config)

**API Endpoints:**
- `POST /api/people` - Public registration (accepts multipart/form-data with photo)
- `GET /api/people` - Admin: list all people
- `PATCH /api/people/:id` - Admin: update person details
- `PATCH /api/people/:id/active` - Admin: activate/deactivate person
- `GET /api/celebrations/today` - Admin: get today's birthdays and anniversaries
- `GET /api/health` - Health check

Admin routes use `x-admin-token` header for authentication (compared against `ADMIN_TOKEN` env var).

### Frontend Structure (frontend/src/)

**Main Components:**
- `App.tsx` - Client-side routing, auth state management, navigation
- `components/JoinForm.tsx` - Public registration form with photo upload
- `components/Dashboard.tsx` - Admin view showing today's celebrations
- `components/RegisteredByMonth.tsx` - Admin view listing all registered people
- `components/EditPersonModal.tsx` - Admin modal for editing person details

**Client-Side Routing:**
The app uses manual routing via `window.history.pushState()` and popstate events:
- `/registro` → Public registration form
- `/admin` → Admin dashboard (requires login)
- `/admin/lista` → Full registered list

Admin token is stored in localStorage (`ADMIN_TOKEN_KEY` constant).

**Data Flow:**
- `api.ts` - API client functions (wraps fetch with error handling)
- `types.ts` - Shared TypeScript interfaces
- `utils.ts` - Date formatting and routing utilities

### Database Schema

**people table:**
- `id` (BIGSERIAL) - Primary key
- `first_name`, `last_name` (TEXT) - 1-80 chars after trimming
- `date_of_birth`, `anniversary_date` (DATE) - Required dates
- `photo_url` (TEXT) - Cloudinary URL or null
- `active` (BOOLEAN) - Default TRUE, soft delete flag
- `created_at` (TIMESTAMPTZ) - Auto-set timestamp

**Indexes:**
- Composite indexes on `(EXTRACT(MONTH), EXTRACT(DAY))` for both date fields (optimizes celebration queries)
- `created_at DESC` index for listing

### Key Features

**Celebration Matching:**
The `findTodayCelebrations()` function in peopleRepository.ts uses month/day extraction to find matches regardless of year. Age/years calculations use PostgreSQL's `AGE()` function.

**Timezone Handling:**
Backend uses `APP_TIME_ZONE` (default: America/Bogota) to determine "today" via `dateUtils.ts`. The frontend receives a `date` field from the API representing the server's concept of today.

**Photo Upload Flow:**
1. Frontend sends multipart/form-data to `POST /api/people`
2. Multer validates file type (jpeg/png/webp) and size (≤15 MB)
3. Backend uploads to Cloudinary via `uploadImage(buffer)`
4. Database stores Cloudinary URL in `photo_url` column
5. Frontend displays images via `getMediaUrl()` helper

**Admin Authentication:**
Simple token-based auth. The `requireAdmin` middleware checks `x-admin-token` header against `ADMIN_TOKEN` env var. Frontend shows login form if token is missing or invalid (401 response).

## Environment Variables

**Backend (.env):**
- `DATABASE_URL` - PostgreSQL connection string (required)
- `ADMIN_TOKEN` - Secret for admin access (required)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Cloudinary credentials (required)
- `PORT` - Server port (default: 4000)
- `CORS_ORIGIN` - Allowed origin (default: http://localhost:5173)
- `APP_TIME_ZONE` - IANA timezone (default: America/Bogota)

**Frontend (.env):**
- `VITE_API_BASE_URL` - Backend API URL (default: http://localhost:4000)

## Testing & Quality

No automated tests currently exist. Type checking is available via TypeScript:
```bash
npm run typecheck --prefix backend
npm run typecheck --prefix frontend
```

## Deployment Notes

- Database migrations run automatically on server start
- Cloudinary handles image storage (ephemeral filesystem not suitable for production)
- Set `CORS_ORIGIN` to production frontend URL
- Change `ADMIN_TOKEN` from dev default before production use
- Frontend builds to `frontend/dist` - serve static files via `npm run start --prefix frontend`
