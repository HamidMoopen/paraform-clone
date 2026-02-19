# Jobaform

A job board platform connecting candidates with hiring managers.

## Features

**For Candidates:**
- Browse and filter open roles by company, location, and salary
- View detailed job postings
- Submit applications with a cover note
- Track application status
- Message hiring managers on interview/accepted applications
- Edit profile (skills, bio, LinkedIn, etc.)

**For Hiring Managers:**
- Create and manage companies
- Post roles with draft/publish/close lifecycle
- Review applications with status management (new → reviewing → interview → accepted/rejected)
- Message candidates in interview or accepted stage

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
