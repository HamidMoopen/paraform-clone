# Phase 5: Polish & Final Touches

## Goal
Elevate the project from "it works" to "this was built with care." This phase is an audit and refinement pass across every page. No new features — just quality, consistency, and attention to detail.

---

## Step 1: Visual Consistency Audit

Go through every page and ensure:

### Typography
- Consistent heading sizes: Page titles use `text-2xl font-bold`, section headers use `text-lg font-semibold`
- Body text is `text-sm` or `text-base` — pick one and be consistent
- Muted secondary text uses `text-muted-foreground` (shadcn convention)
- No orphaned large text or inconsistent font weights

### Spacing
- Consistent page padding: `px-4 py-6` or `p-6` on all page containers
- Consistent card padding: `p-4` or `p-6`
- Consistent gap between elements: `gap-4` for card grids, `gap-6` between sections
- No cramped layouts — everything should breathe

### Color
- Status badges use the color map from `constants.ts` — verify everywhere
- Primary actions use the primary color (shadcn default blue/black)
- Destructive actions (close role, reject application) use `variant="destructive"`
- No random one-off colors

### Components
- All buttons use shadcn `Button` with appropriate variants
- All form inputs use shadcn `Input`, `Select`, `Textarea`
- All badges use shadcn `Badge`
- All cards use shadcn `Card` with `CardHeader`, `CardContent`, `CardFooter` where appropriate
- No raw HTML `<button>` or `<input>` elements

---

## Step 2: Loading States Audit

Every page that fetches data should have a loading skeleton. Go through each page:

### Create a shared skeleton component: `src/components/shared/page-skeleton.tsx`
- `RoleCardSkeleton` — matches role card layout with pulsing placeholders
- `ApplicationCardSkeleton` — matches application card layout
- `FormSkeleton` — generic form placeholder
- `TableRowSkeleton` — for list views

### Pages to verify:
- [ ] Landing page (persona loading)
- [ ] Browse roles (role cards skeleton)
- [ ] Role detail (full page skeleton)
- [ ] My Applications (application cards skeleton)
- [ ] HM company selector (company cards skeleton)
- [ ] HM roles list (role rows skeleton)
- [ ] HM role detail (page skeleton)
- [ ] HM applications review (application cards skeleton)
- [ ] Messages thread (message bubbles skeleton)
- [ ] Messages thread list (thread row skeleton)

**Implementation pattern:**
```typescript
if (isLoading) return <RoleCardSkeleton count={6} />
if (error) return <ErrorState message="Failed to load roles" onRetry={refetch} />
if (data.length === 0) return <EmptyState ... />
return <RoleList roles={data} />
```

---

## Step 3: Empty States Audit

Create a shared empty state component: `src/components/shared/empty-state.tsx`

**Props:**
- `icon` — Lucide icon component
- `title` — e.g., "No roles yet"
- `description` — e.g., "When you publish roles, they'll appear here"
- `action` — optional CTA button (label + onClick/href)

### Empty states needed:
- [ ] Browse roles: "No roles match your filters" + "Clear filters" button
- [ ] Browse roles (truly empty): "No open roles right now. Check back soon!"
- [ ] My applications: "You haven't applied to any roles yet" + "Browse Roles" link
- [ ] HM company selector: "You don't have any companies yet" + "Create Company" button
- [ ] HM roles list: "No roles for this company yet" + "Create Your First Role" button
- [ ] HM roles list (filtered tab): "No {status} roles"
- [ ] HM applications (no applications): "No applications received yet. Share your role to get candidates!"
- [ ] HM applications (filtered tab): "No {status} applications"
- [ ] Messages (no threads): "No messages yet. Accept an application to start a conversation."
- [ ] Message thread (no messages): "Start the conversation" prompt

---

## Step 4: Error States Audit

Create a shared error component: `src/components/shared/error-state.tsx`

**Props:**
- `message` — what went wrong
- `onRetry` — optional retry callback

### Error handling to verify:
- [ ] API fetch failures show error state (not blank page or console error)
- [ ] Form submission failures show error toast
- [ ] 404 pages for invalid role IDs, company IDs
- [ ] Network errors during message sending show retry option
- [ ] Validation errors show inline (not alert boxes)

Create a custom 404 page: `src/app/not-found.tsx`
- Friendly message: "Page not found"
- "Go Home" button

---

## Step 5: Form Validation Audit

Go through every form and ensure:

### Input validation:
- [ ] All required fields show errors when empty on submit
- [ ] Email fields validate format
- [ ] URL fields validate format (LinkedIn, website)
- [ ] Number fields (salary, experience) validate range
- [ ] Salary max >= salary min (cross-field validation)
- [ ] Textarea character counts are shown and enforced
- [ ] Description minimum length is enforced

### UX:
- [ ] Errors appear inline below the field (not in an alert)
- [ ] Error text is red with `text-destructive` class
- [ ] Fields with errors have a red border
- [ ] Errors clear when the user starts typing
- [ ] Submit button shows loading spinner during submission
- [ ] Submit button is disabled while submitting (prevent double submit)
- [ ] Success shows a toast notification (not an alert)

---

## Step 6: Responsive Design Audit

Test every page at common desktop widths (1024px, 1280px, 1440px). Not mobile-first, but nothing should break.

### Key responsive behaviors:
- [ ] Landing page: persona cards stack or wrap on narrow screens
- [ ] Role filters: horizontal on wide, stack on narrow
- [ ] Role cards: maintain readability at all widths
- [ ] Two-panel message layout: collapse to single panel on narrow screens
- [ ] Forms: single column on narrow, two-column on wide (where applicable)
- [ ] Tables/lists: no horizontal scrolling
- [ ] Navigation: doesn't overflow

### Container widths:
- Max width `max-w-7xl` for list pages
- Max width `max-w-3xl` or `max-w-2xl` for forms and detail pages
- Always `mx-auto` for centering
- Horizontal padding `px-4 sm:px-6 lg:px-8`

---

## Step 7: Page Titles & Metadata

Ensure every page sets appropriate metadata:

### Using Next.js metadata:

For static pages:
```typescript
export const metadata: Metadata = {
  title: 'Browse Roles | Job Board',
}
```

For dynamic pages (roles detail, company pages):
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const role = await fetchRole(params.roleId)
  return {
    title: `${role.title} at ${role.company.name} | Job Board`,
  }
}
```

### Pages to verify:
- [ ] `/` → "Job Board"
- [ ] `/candidate/roles` → "Browse Roles | Job Board"
- [ ] `/candidate/roles/[id]` → "{Role Title} at {Company} | Job Board"
- [ ] `/candidate/applications` → "My Applications | Job Board"
- [ ] `/candidate/profile` → "Edit Profile | Job Board"
- [ ] `/hiring` → "Your Companies | Job Board"
- [ ] `/hiring/new-company` → "Create Company | Job Board"
- [ ] `/hiring/company/[id]/roles` → "Roles — {Company} | Job Board"
- [ ] `/hiring/company/[id]/roles/new` → "Create Role — {Company} | Job Board"
- [ ] `/hiring/company/[id]/roles/[id]` → "{Role Title} — Manage | Job Board"
- [ ] `/hiring/company/[id]/roles/[id]/applications` → "Applications — {Role Title} | Job Board"
- [ ] `/hiring/messages` → "Messages | Job Board"

---

## Step 8: Favicon & Branding

- [ ] Add a simple favicon (can use an emoji-based one or a simple geometric logo)
  - Quick option: use a service like favicon.io to generate from a letter or emoji
  - Place in `public/favicon.ico` and `public/icon.svg`
- [ ] Ensure the app name in the nav is styled consistently (e.g., bold "JobBoard" or "Paraform Board")
- [ ] Add a small footer on the landing page: "Built as a take-home project · 2025"

---

## Step 9: Seed Data Quality Check

Revisit the seed data and ensure:
- [ ] Job descriptions feel realistic and are well-formatted
- [ ] Company descriptions are compelling
- [ ] Candidate profiles are diverse and realistic
- [ ] Pre-existing applications demonstrate different statuses
- [ ] Pre-existing messages show a natural conversation
- [ ] The demo data tells a story — reviewer should immediately understand the app

---

## Step 10: Final Code Quality Pass

### Clean up:
- [ ] Remove all `console.log` statements (except in seed script)
- [ ] Remove unused imports
- [ ] Remove commented-out code
- [ ] Ensure consistent file naming (kebab-case for files, PascalCase for components)
- [ ] Add brief JSDoc comments on API routes explaining what they do
- [ ] Ensure all TypeScript types are explicit (no `any` types)

### README.md:
Create a polished README:

```markdown
# Job Board

A minimal job board application built as a take-home project.

## Features

**For Candidates:**
- Browse and filter open roles by company, location, and salary
- View detailed job postings
- Submit applications with a cover note
- Track application status
- Message hiring managers on accepted applications

**For Hiring Managers:**
- Create and manage companies
- Post roles with draft/publish/close lifecycle
- Review applications with status management
- Message accepted candidates

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite via Prisma ORM
- **UI:** shadcn/ui + Tailwind CSS
- **Validation:** Zod
- **Language:** TypeScript

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the database: `npx prisma migrate dev`
4. Seed demo data: `npx prisma db seed`
5. Start the dev server: `npm run dev`
6. Open http://localhost:3000

## Demo Personas

The app comes pre-loaded with demo personas:

**Hiring Managers:**
- Sarah Chen (VP Engineering @ Acme AI)
- Marcus Rivera (Head of Product @ CloudSync)
- Priya Patel (Engineering Manager @ HealthStack)

**Candidates:**
- Alex Johnson (Full-Stack Engineer, 3yr exp)
- Jordan Lee (New Grad, CS @ Stanford)
- Sam Taylor (Senior SWE, 8yr exp)

## Architecture Decisions

- **No auth:** Persona selection replaces authentication for demo purposes
- **SQLite:** Zero-config, portable database — swap to Postgres via one Prisma config change
- **Soft deletes:** Closing a role preserves application data
- **Polymorphic messaging:** Messages reference either HM or candidate as sender
```

---

## Step 11: Final Testing Walkthrough

Walk through these exact scenarios as a final check:

### Candidate Flow:
1. Open app → see landing page with persona options
2. Select "Alex Johnson" → redirected to Browse Roles
3. See published roles (no draft/closed roles visible)
4. Filter by company "CloudSync" → see only CloudSync roles
5. Filter by salary min $150k → roles below threshold disappear
6. Clear filters → all roles return
7. Click "Backend Engineer - Core Platform" → see full job detail page
8. Note: Alex already applied to this role (via seed data) — this role should be hidden from browse OR show "Already Applied" state
9. Click a different role → click "Apply Now" → see pre-filled dialog with Alex's info
10. Add a cover note → submit → see success toast → redirected to My Applications
11. Go to My Applications → see the new application + pre-existing ones
12. On accepted applications → click "Message" → see conversation thread
13. Send a message → it appears in the thread

### Hiring Manager Flow:
1. Go back to landing → switch to "Priya Patel"
2. See company selector → "HealthStack" with role count + application count
3. Click HealthStack → see roles list
4. See status tabs with correct counts (published, closed roles)
5. Click "Full-Stack Engineer" → see role detail with management controls
6. Click "View Applications" → see Sam Taylor's accepted application
7. See Sam's profile info, cover note, status
8. Go to Messages → see the conversation thread with Sam
9. Send a message → it appears
10. Go back to roles → click "Create New Role" → fill out form → publish
11. New role appears in the list
12. Switch to candidate persona → verify the new role appears in browse

---

## Checklist — Ship It

- [ ] All flows from Step 11 work end-to-end
- [ ] No console errors in the browser
- [ ] No TypeScript errors (`npm run build` passes)
- [ ] All pages have appropriate loading, error, and empty states
- [ ] All forms have inline validation
- [ ] All pages have correct titles
- [ ] Favicon is present
- [ ] README is complete
- [ ] Seed data runs cleanly from scratch (`npx prisma migrate reset` + `npx prisma db seed`)
- [ ] The app looks intentional and polished — not like scaffolded boilerplate

---

## 🎉 Done

You've built a complete, polished job board with:
- Two distinct user experiences (candidate + HM)
- Full CRUD on companies, roles, and applications
- Status lifecycle management
- Filtering and pagination
- Messaging between parties
- Proper data modeling with constraints
- Consistent, accessible UI
- Realistic demo data that tells a story
