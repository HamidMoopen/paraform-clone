# Jobaform

A minimal job board application built as a take-home project.

## Features

**For Candidates:**
- Browse and filter open roles by company, location, and salary
- View detailed job postings
- Submit applications with a cover note
- Track application status
- Message hiring managers on accepted/interview applications
- Edit profile (skills, bio, LinkedIn, etc.)

**For Hiring Managers:**
- Create and manage companies
- Post roles with draft/publish/close lifecycle
- Review applications with status management (new → reviewing → interview → accepted/rejected)
- Message accepted candidates

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon) via Prisma ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Validation:** Zod
- **Language:** TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your database connection strings:
   ```
   DATABASE_URL="postgresql://..."
   DIRECT_URL="postgresql://..."
   ```
4. Set up the database: `npx prisma migrate dev`
5. Seed demo data: `npx prisma db seed`
6. Start the dev server: `npm run dev`
7. Open http://localhost:3000

## Demo Personas

The app comes pre-loaded with demo personas:

**Hiring Managers:**
- Sarah Chen (VP of Engineering @ Acme AI, CloudSync)
- Marcus Rivera (Head of Product @ CloudSync)
- Priya Patel (Engineering Manager @ HealthStack)

**Candidates:**
- Alex Johnson (Full-Stack Engineer, 3yr exp)
- Jordan Lee (New Grad, CS @ Stanford)
- Sam Taylor (Senior SWE, 8yr exp)

## Architecture Decisions

- **No auth:** Persona selection replaces authentication for demo purposes
- **PostgreSQL (Neon):** Managed Postgres with connection pooling — swap the connection string for any Postgres provider
- **Soft deletes:** Closing a role preserves application data
- **Polymorphic messaging:** Messages reference either HM or candidate as sender
- **Client-side routing guards:** Persona context + localStorage ensures correct user type per section
