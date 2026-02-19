# Phase 2: Candidate Experience

## Goal
Build the complete candidate-facing flow: browsing roles with filters, viewing role details, applying, and viewing submitted applications. By the end of this phase, a candidate can go from "browse roles" → "apply" → "see my applications" end-to-end.

---

## Step 1: Candidate Layout Shell

Create `src/app/candidate/layout.tsx`:

**Design direction:**
- Top navigation bar with:
  - Logo/app name (links to `/candidate/roles`)
  - Two nav links: "Browse Roles" and "My Applications"
  - Right side: persona avatar + name, "Switch Persona" link
- Clean white background, max-width container (e.g., `max-w-6xl mx-auto`)
- Active nav link gets a visual indicator (underline or bold)

**Key behaviors:**
- If no persona is set or persona type is not `candidate`, redirect to `/`
- Show a loading skeleton while persona is hydrating from localStorage

---

## Step 2: Roles API (GET with filters)

Create `src/app/api/roles/route.ts`:

**GET `/api/roles`** — Returns published, non-deleted roles with optional filters.

**Query parameters:**
- `company` — filter by company ID
- `location` — partial match on location string
- `salaryMin` — minimum salary floor (filter roles where `salaryMax >= salaryMin`)
- `salaryMax` — maximum salary ceiling (filter roles where `salaryMin <= salaryMax`)
- `search` — full text search on title and description
- `candidateId` — if provided, EXCLUDE roles the candidate has already applied to
- `page` — page number (default 1)
- `limit` — results per page (default 10)

**Response shape:**
```json
{
  "roles": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "location": "...",
      "locationType": "...",
      "salaryMin": 160000,
      "salaryMax": 220000,
      "employmentType": "full-time",
      "experienceLevel": "senior",
      "status": "published",
      "createdAt": "...",
      "company": {
        "id": "...",
        "name": "Acme AI",
        "logoUrl": "..."
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Implementation notes:**
- Always filter `WHERE status = 'published' AND deletedAt IS NULL`
- Include company relation in the query
- When `candidateId` is provided, do a subquery to exclude roles with existing applications from that candidate
- Use Prisma's `skip` and `take` for pagination

Also create **GET `/api/roles/[roleId]/route.ts`** for single role detail:
- Include company details
- Include application count (for later use by HM views too)
- Return 404 if role is deleted or doesn't exist

---

## Step 3: Companies API (for filter dropdown)

Create `src/app/api/companies/route.ts`:

**GET `/api/companies`** — Returns all companies (for the filter dropdown).

```json
{
  "companies": [
    { "id": "...", "name": "Acme AI" },
    { "id": "...", "name": "CloudSync" },
    { "id": "...", "name": "HealthStack" }
  ]
}
```

---

## Step 4: Browse Roles Page

Create `src/app/candidate/roles/page.tsx`:

**Design direction:**
- Page title: "Browse Open Roles" with a subtitle like "Find your next opportunity"
- Filter bar at the top (horizontal on desktop):
  - Company dropdown (Select component, populated from `/api/companies`)
  - Location text input (debounced search)
  - Salary range: two inputs (min/max) or a combined range display
  - "Clear filters" button when any filter is active
- Below filters: role count ("Showing 8 roles" or "No roles match your filters")
- Role cards in a grid or list layout (recommend list for better scanability)
- Pagination at the bottom

**Role Card component (`src/components/roles/role-card.tsx`):**
- Company logo (or initials fallback) + company name
- Role title (large, clickable — links to `/candidate/roles/[roleId]`)
- Location with location type badge (Remote, Hybrid, Onsite)
- Salary range
- Employment type badge
- Experience level badge
- "Posted X days ago" timestamp
- The whole card is clickable

**Key behaviors:**
- Filters update URL query params (so the state is shareable/bookmarkable)
- Debounce location search (300ms)
- Show loading skeleton while fetching
- Empty state when no roles match filters: friendly message + "Clear filters" CTA
- Pass `candidateId` to the API so roles already applied to are hidden

**Component breakdown:**
- `RoleFilters` — the filter bar
- `RoleCard` — individual role card
- `RoleList` — the list + pagination + empty state

---

## Step 5: Role Detail Page

Create `src/app/candidate/roles/[roleId]/page.tsx`:

**Design direction:**
Model this after real job postings (like the Ashby example in the spec). This should be the most "designed" page in the app.

**Layout:**
- Header section:
  - Company logo + company name (clickable? just display)
  - Role title (large)
  - Key metadata in a horizontal row: Location, Salary, Employment Type, Experience Level
  - "Apply Now" button (prominent, top right or below metadata)
  - "Posted X days ago"
- Body section:
  - Full role description (rendered as markdown-ish — support basic formatting with line breaks and bold via `**text**`)
  - Company info sidebar or section: company name, description, industry, website link
- Sticky bottom bar (mobile) or sidebar CTA: "Apply Now" button

**Key behaviors:**
- Fetch role from `/api/roles/[roleId]`
- Show loading skeleton while fetching
- 404 page if role not found
- "Apply Now" opens an application dialog/modal (built in Step 6)
- After successful application, redirect to `/candidate/applications` with a success toast
- Dynamic page title: `"{Role Title} at {Company Name} | Job Board"`

---

## Step 6: Application Submission

Create `src/app/api/applications/route.ts`:

**POST `/api/applications`** — Submit a new application.

**Request body:**
```json
{
  "roleId": "...",
  "candidateId": "...",
  "coverNote": "Optional short note..."
}
```

**Validation (using Zod):**
- All required fields present
- `roleId` exists and is published
- `candidateId` exists
- No duplicate application (unique constraint will catch this, but validate upfront for a better error message)

**Response:** Created application object with 201 status.

**Application Dialog/Modal component (`src/components/applications/apply-dialog.tsx`):**
- Triggered by "Apply Now" button on role detail page
- Pre-filled with candidate's info (name, email, LinkedIn from persona — shown as read-only confirmation)
- One editable field: "Cover Note" (optional textarea, max 1000 chars, with character count)
- "Submit Application" button with loading state
- On success: close dialog, show toast "Application submitted!", redirect to `/candidate/applications`
- On duplicate error: show "You've already applied to this role" message
- Form validation with inline errors (Zod + react-hook-form or manual)

---

## Step 7: My Applications Page

Create `src/app/candidate/applications/page.tsx`:

**API needed:** **GET `/api/applications?candidateId=...`**

Add to `src/app/api/applications/route.ts`:

**Query parameters:**
- `candidateId` — required, filter by candidate
- `page`, `limit` — pagination

**Response includes:**
- Application status
- Role title, company name, salary range
- Applied date
- Cover note
- Whether messaging is available (status === 'accepted')

**Design direction:**
- Page title: "My Applications"
- List of application cards, ordered by most recent first
- Each card shows:
  - Role title + company name
  - Application status badge (colored by status)
  - "Applied X days ago"
  - Cover note preview (truncated)
  - If status is "accepted": "Message" button (links to messaging — Phase 5)
- Empty state: "You haven't applied to any roles yet" + "Browse Roles" CTA
- Pagination

**Application Card component (`src/components/applications/application-card.tsx`):**
- Company logo + name
- Role title
- Status badge (uses the color map from constants)
- Timestamp
- Expandable cover note
- Message CTA (conditional on accepted status)

---

## Step 8: Candidate Profile Page (Lightweight)

Create `src/app/candidate/profile/page.tsx`:

**This is the "resume stand-in" — a basic editable profile.**

Add a "Profile" link to the candidate nav bar.

**API needed:** 
- **GET `/api/candidates/[candidateId]/route.ts`** — Get candidate profile
- **PATCH `/api/candidates/[candidateId]/route.ts`** — Update candidate profile

**Form fields:**
- Name (text input)
- Email (email input)
- LinkedIn URL (url input)
- Headline (text input, e.g., "Senior SWE · 5 years exp")
- Years of Experience (number input)
- Skills (text input, comma-separated)
- Short Bio (textarea, max 1000 chars)

**Key behaviors:**
- Pre-filled from persona data
- Inline validation (Zod schema)
- Save button with loading state
- Success toast on save
- This profile data is what HMs see when reviewing applications

---

## Checklist Before Moving On

- [ ] Candidate can browse all published roles (draft/closed roles hidden)
- [ ] Filters work: company dropdown, location search, salary range
- [ ] Roles already applied to are hidden from the browse list
- [ ] Clicking a role card opens the detail page with full description
- [ ] "Apply Now" opens a dialog with pre-filled candidate info
- [ ] Submitting an application shows a success toast and redirects
- [ ] Duplicate application is caught with a friendly error
- [ ] "My Applications" shows all submitted applications with correct statuses
- [ ] Application status badges are color-coded
- [ ] Profile page is editable and saves correctly
- [ ] Empty states show on all pages when appropriate
- [ ] Loading skeletons appear during data fetches
- [ ] Pagination works on roles list and applications list
- [ ] URL query params update with filters (shareable state)
- [ ] Page titles are dynamic per page

---

## What's Next

Phase 3 builds the hiring manager experience: company management, role creation, and application review.
