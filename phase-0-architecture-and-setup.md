# Phase 0: Architecture & Project Setup

## Goal
Establish the project foundation — tech stack, folder structure, database schema, and dev tooling. Nothing renders yet. By the end of this phase, you have a running Next.js app with a connected database and a clean, extensible project structure.

---

## Step 1: Initialize the Project

Create a new Next.js 14+ app with the App Router, TypeScript, Tailwind CSS, and ESLint.

```bash
npx create-next-app@latest paraform-job-board --typescript --tailwind --eslint --app --src-dir
```

**Key decisions:**
- Use the `src/` directory for cleaner separation from config files
- App Router (not Pages Router) — it's the modern standard and shows you're current
- Tailwind for utility-first styling (fast to build, easy to keep consistent)

---

## Step 2: Install Core Dependencies

```bash
# Database
npm install prisma @prisma/client
npx prisma init --datasource-provider sqlite

# UI primitives (shadcn/ui for polished components without heavy overhead)
npx shadcn@latest init

# Utility libraries
npm install zod               # Schema validation for forms + API
npm install date-fns           # Date formatting
npm install lucide-react       # Icons
npm install sonner             # Toast notifications

# shadcn components to install upfront
npx shadcn@latest add button card input label select textarea badge dialog toast separator tabs dropdown-menu avatar form table pagination
```

**Why SQLite via Prisma?**
- Zero infrastructure. Reviewer clones the repo and runs `npx prisma migrate dev` — done.
- Prisma gives you type-safe queries and clean migrations.
- If they ask "would this scale?" you can say "swap the datasource to Postgres in one line."

**Why shadcn/ui?**
- It's not a component library — it copies components into your project. You own the code.
- Shows you can build polished UI without reinventing buttons and dialogs.
- Fully accessible out of the box (built on Radix UI).

---

## Step 3: Folder Structure

Set up this folder structure inside `src/`. Do NOT create placeholder files — just the directories. Files will be created in subsequent phases.

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (global providers, fonts, metadata)
│   ├── page.tsx                  # Landing page (role selection)
│   ├── globals.css               # Tailwind + custom CSS
│   │
│   ├── candidate/                # All candidate-facing pages
│   │   ├── layout.tsx            # Candidate shell (nav, footer)
│   │   ├── roles/
│   │   │   ├── page.tsx          # Browse all roles (with filters)
│   │   │   └── [roleId]/
│   │   │       └── page.tsx      # Role detail + apply
│   │   └── applications/
│   │       └── page.tsx          # My applications list
│   │
│   ├── hiring/                   # All hiring manager pages
│   │   ├── layout.tsx            # HM shell (nav, sidebar)
│   │   ├── page.tsx              # HM dashboard / company selector
│   │   ├── company/
│   │   │   └── [companyId]/
│   │   │       ├── page.tsx      # Company overview (placeholder)
│   │   │       ├── roles/
│   │   │       │   ├── page.tsx  # Roles list for this company
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx  # Create new role
│   │   │       │   └── [roleId]/
│   │   │       │       ├── page.tsx          # Role detail (HM view)
│   │   │       │       └── applications/
│   │   │       │           └── page.tsx      # Applications for this role
│   │   │       └── new-company/
│   │   │           └── page.tsx  # Create new company form
│   │   └── messages/
│   │       └── page.tsx          # Message threads
│   │
│   └── api/                      # API routes
│       ├── companies/
│       │   └── route.ts          # GET (list), POST (create)
│       ├── roles/
│       │   ├── route.ts          # GET (list with filters), POST (create)
│       │   └── [roleId]/
│       │       └── route.ts      # GET (detail), PATCH (update status)
│       ├── applications/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [applicationId]/
│       │       └── route.ts      # PATCH (update status)
│       ├── messages/
│       │   └── route.ts          # GET (threads), POST (send)
│       └── personas/
│           └── route.ts          # GET (list personas for selection)
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (auto-generated)
│   ├── layout/                   # Navigation, shells, footers
│   ├── roles/                    # Role card, role form, role filters
│   ├── applications/             # Application card, application form, status badge
│   ├── companies/                # Company card, company form
│   └── shared/                   # Empty state, page header, loading skeleton
│
├── lib/                          # Core utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── validators.ts             # Zod schemas for all entities
│   ├── constants.ts              # Enums, status labels, colors
│   ├── utils.ts                  # General helpers (cn, formatCurrency, etc.)
│   └── types.ts                  # Shared TypeScript types/interfaces
│
├── hooks/                        # Custom React hooks
│   └── use-persona.ts            # Hook to get/set current persona from context
│
└── providers/                    # React context providers
    └── persona-provider.tsx      # Stores current user persona in React context + localStorage
```

**Why this structure matters:**
- `app/candidate/` and `app/hiring/` are completely separate route trees with their own layouts. This mirrors how real products separate user experiences.
- `components/` is organized by domain (roles, applications, companies), NOT by type (buttons, modals). This scales better.
- `lib/` keeps business logic out of components.
- API routes mirror the data model, making them predictable.

---

## Step 4: Database Schema

Create this Prisma schema in `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Company {
  id          String   @id @default(cuid())
  name        String
  description String?
  industry    String?
  location    String?
  website     String?
  logoUrl     String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roles          Role[]
  hiringManagers HiringManagerCompany[]
}

model HiringManager {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  avatarUrl String?
  title     String?
  isPersona Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  companies       HiringManagerCompany[]
  roles           Role[]
  sentMessages    Message[]              @relation("SentMessages")
}

// Join table: HM can belong to multiple companies
model HiringManagerCompany {
  id              String         @id @default(cuid())
  hiringManagerId String
  companyId       String
  joinedAt        DateTime       @default(now())

  hiringManager HiringManager @relation(fields: [hiringManagerId], references: [id])
  company       Company       @relation(fields: [companyId], references: [id])

  @@unique([hiringManagerId, companyId])
}

model Role {
  id               String     @id @default(cuid())
  title            String
  description      String
  location         String
  locationType     String     @default("onsite") // onsite, remote, hybrid
  salaryMin        Int?
  salaryMax        Int?
  salaryCurrency   String     @default("USD")
  employmentType   String     @default("full-time") // full-time, part-time, contract, internship
  experienceLevel  String?    // entry, mid, senior, lead
  status           String     @default("draft") // draft, published, closed
  deletedAt        DateTime?  // Soft delete
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt

  companyId        String
  hiringManagerId  String

  company      Company       @relation(fields: [companyId], references: [id])
  hiringManager HiringManager @relation(fields: [hiringManagerId], references: [id])
  applications Application[]
}

model Candidate {
  id              String   @id @default(cuid())
  name            String
  email           String   @unique
  linkedinUrl     String?
  avatarUrl       String?
  headline        String?  // e.g. "Senior SWE | 5 years exp"
  yearsExperience Int?
  skills          String?  // Comma-separated for simplicity
  bio             String?
  isPersona       Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  applications Application[]
  sentMessages Message[]     @relation("CandidateMessages")
}

model Application {
  id          String   @id @default(cuid())
  status      String   @default("new") // new, reviewing, interview, accepted, rejected
  coverNote   String?  // Optional short note from candidate
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  roleId      String
  candidateId String

  role      Role      @relation(fields: [roleId], references: [id])
  candidate Candidate @relation(fields: [candidateId], references: [id])
  messages  Message[]

  @@unique([roleId, candidateId]) // Candidate can only apply once per role
}

model Message {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())

  applicationId    String
  // Polymorphic sender: either HM or Candidate sent it
  hiringManagerId  String?
  candidateId      String?

  application   Application    @relation(fields: [applicationId], references: [id])
  hiringManager HiringManager? @relation("SentMessages", fields: [hiringManagerId], references: [id])
  candidate     Candidate?     @relation("CandidateMessages", fields: [candidateId], references: [id])
}
```

**Schema design notes:**
- `HiringManagerCompany` is an explicit join table (not implicit many-to-many) because you'll likely want metadata on the relationship later (role within company, permissions, etc.)
- `Role.deletedAt` enables soft deletes — closing a role sets this timestamp instead of removing the row
- `Application` has a unique constraint on `[roleId, candidateId]` enforcing one application per candidate per role at the database level
- `Message` uses a polymorphic sender pattern — either `hiringManagerId` or `candidateId` is set, never both. Simple and avoids a complex sender abstraction.
- `isPersona` flag on HMs and Candidates distinguishes seed personas from user-created entities

After creating the schema:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

## Step 5: Prisma Client Singleton

Create `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

This prevents multiple Prisma clients during Next.js hot reload.

---

## Step 6: Constants & Types

Create `src/lib/constants.ts`:

```typescript
export const ROLE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CLOSED: 'closed',
} as const

export const APPLICATION_STATUS = {
  NEW: 'new',
  REVIEWING: 'reviewing',
  INTERVIEW: 'interview',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
} as const

export const LOCATION_TYPE = {
  ONSITE: 'onsite',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
} as const

export const EMPLOYMENT_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
} as const

export const EXPERIENCE_LEVEL = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  LEAD: 'lead',
} as const

// Display labels
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800',
  reviewing: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-purple-100 text-purple-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export const ROLE_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  closed: 'Closed',
}

export const ROLE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  published: 'bg-green-100 text-green-800',
  closed: 'bg-red-100 text-red-800',
}
```

---

## Step 7: Zod Validators

Create `src/lib/validators.ts`:

```typescript
import { z } from 'zod'

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  description: z.string().max(500).optional(),
  industry: z.string().max(50).optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const createRoleSchema = z.object({
  title: z.string().min(1, 'Job title is required').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
  location: z.string().min(1, 'Location is required').max(100),
  locationType: z.enum(['onsite', 'remote', 'hybrid']),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  salaryCurrency: z.string().default('USD'),
  employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  companyId: z.string().min(1),
  hiringManagerId: z.string().min(1),
}).refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin
    }
    return true
  },
  { message: 'Maximum salary must be greater than minimum salary', path: ['salaryMax'] }
)

export const createApplicationSchema = z.object({
  roleId: z.string().min(1),
  candidateId: z.string().min(1),
  coverNote: z.string().max(1000).optional(),
})

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'interview', 'accepted', 'rejected']),
})

export const updateRoleStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'closed']),
})

export const createMessageSchema = z.object({
  applicationId: z.string().min(1),
  content: z.string().min(1, 'Message cannot be empty').max(2000),
  hiringManagerId: z.string().optional(),
  candidateId: z.string().optional(),
}).refine(
  (data) => {
    // Exactly one sender must be specified
    return (!!data.hiringManagerId) !== (!!data.candidateId)
  },
  { message: 'Exactly one sender (HM or candidate) must be specified' }
)

export const updateCandidateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Must be a valid email'),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  headline: z.string().max(100).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  skills: z.string().max(500).optional(),
  bio: z.string().max(1000).optional(),
})
```

---

## Step 8: Utility Helpers

Create `src/lib/utils.ts` (extend the one shadcn may have already created):

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatSalaryRange(min?: number | null, max?: number | null, currency: string = 'USD'): string {
  if (min && max) return `${formatCurrency(min, currency)} - ${formatCurrency(max, currency)}`
  if (min) return `From ${formatCurrency(min, currency)}`
  if (max) return `Up to ${formatCurrency(max, currency)}`
  return 'Salary not specified'
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
```

---

## Checklist Before Moving On

- [ ] `npm run dev` starts without errors
- [ ] Prisma migration ran successfully (`npx prisma migrate dev --name init`)
- [ ] `npx prisma studio` opens and shows all 6 tables (Company, HiringManager, HiringManagerCompany, Role, Candidate, Application, Message)
- [ ] All files in `src/lib/` compile without TypeScript errors
- [ ] Folder structure matches the tree above (directories created, no placeholder files needed yet)
- [ ] `.env` file has `DATABASE_URL="file:./dev.db"`

---

## What's Next

Phase 1 will create the seed script with realistic demo data and the persona selection system. This is critical because every subsequent phase will use these personas to test the UI.
