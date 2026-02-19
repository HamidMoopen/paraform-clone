# Phase 3: Hiring Manager Experience

## Goal
Build the complete HM-facing flow: company selection/creation, role management (create, view, change status), and application review with status updates. By the end of this phase, a HM can manage their roles and review incoming applications.

---

## Step 1: HM Layout Shell

Create `src/app/hiring/layout.tsx`:

**Design direction:**
- Top navigation bar with:
  - Logo/app name (links to `/hiring`)
  - Active company name (if one is selected) — acts as a breadcrumb
  - Nav links (shown only when a company is active): "Roles", "Create Role"
  - Right side: persona avatar + name + title, "Switch Persona" link
- Slightly different visual treatment than candidate layout (e.g., subtle background color difference or a left accent) so it's immediately clear you're in "manager mode"
- Same max-width container pattern

**Key behaviors:**
- If no persona is set or persona type is not `hiring-manager`, redirect to `/`
- If persona is set but no `activeCompanyId`, show the company selector (Step 2)
- Show loading skeleton while persona is hydrating

---

## Step 2: HM Dashboard / Company Selector

Create `src/app/hiring/page.tsx`:

This is the first page a HM sees after persona selection. It serves two purposes: select which company to manage, or create a new one.

**API needed:** **GET `/api/companies?hiringManagerId=...`**

Update `src/app/api/companies/route.ts` to support filtering by HM:
- If `hiringManagerId` query param is provided, return only companies that HM belongs to
- Include a count of active roles per company
- Include a count of new (unreviewed) applications across all roles

**Design direction:**
- Page title: "Your Companies" with subtitle "Select a company to manage, or create a new one"
- Company cards in a grid (2-3 columns):
  - Company name + logo (initials fallback)
  - Industry tag
  - Location
  - Stats row: "X active roles · Y new applications"
  - Click → set `activeCompanyId` in persona context → redirect to `/hiring/company/[companyId]/roles`
- "Create New Company" card at the end — styled as an add button/dashed border card
  - Click → navigate to company creation form

**Key behaviors:**
- If HM only has one company, you could auto-select it (nice touch, but not required)
- After selecting a company, all subsequent HM pages scope to that company
- "Switch Company" option in the nav to come back to this page

---

## Step 3: Create Company

Create `src/app/hiring/new-company/page.tsx`:

**API needed:** **POST `/api/companies`**

**Request body:**
```json
{
  "name": "Company Name",
  "description": "What the company does",
  "industry": "AI / Machine Learning",
  "location": "San Francisco, CA",
  "website": "https://example.com",
  "hiringManagerId": "..."
}
```

**Backend logic:**
- Create the company
- Create the `HiringManagerCompany` join record
- Return the created company

**Form fields:**
- Company Name (required)
- Description (textarea, optional)
- Industry (text input or dropdown with common options, optional)
- Location (text input, optional)
- Website (URL input, optional)

**Design direction:**
- Clean centered form (max-width ~600px)
- Page title: "Create a New Company"
- Inline validation errors
- "Create Company" button with loading state
- On success: toast "Company created!", set `activeCompanyId`, redirect to `/hiring/company/[companyId]/roles`

---

## Step 4: Roles List (HM View)

Create `src/app/hiring/company/[companyId]/roles/page.tsx`:

**API reuse:** Use **GET `/api/roles?companyId=...&includeAll=true`**

Update the roles API to support:
- `companyId` filter
- `includeAll=true` flag that returns ALL statuses (draft, published, closed) — only for HM views
- `hiringManagerId` filter (optional, for scoping to roles this HM created)
- Include `_count.applications` in the response

**Design direction:**
- Page title: "Roles at {Company Name}"
- "Create New Role" button (top right, prominent)
- Filter tabs: "All" | "Published" | "Draft" | "Closed" — with counts
- Role list (table-like or card list):
  - Role title
  - Status badge (Draft = gray, Published = green, Closed = red)
  - Location + type
  - Salary range
  - Application count badge (e.g., "12 applications")
  - Application status summary: "3 new · 2 reviewing · 1 interview"
  - "Posted X days ago"
  - Click → role detail (HM view)
- Empty state per tab: "No draft roles" etc.

**Key behaviors:**
- Default tab is "All" or "Published"
- Clicking a role navigates to `/hiring/company/[companyId]/roles/[roleId]`
- "Create New Role" navigates to `/hiring/company/[companyId]/roles/new`

---

## Step 5: Create Role

Create `src/app/hiring/company/[companyId]/roles/new/page.tsx`:

**API needed:** **POST `/api/roles`**

**Request body validated with `createRoleSchema` from validators.ts.**

**Form fields:**
- Job Title (required)
- Description (required, textarea — large, with character count)
- Location (required, text input)
- Location Type (select: Onsite, Remote, Hybrid)
- Salary Range: Min + Max inputs (number, optional)
- Employment Type (select: Full-time, Part-time, Contract, Internship)
- Experience Level (select: Entry, Mid, Senior, Lead — optional)
- Initial Status: "Save as Draft" or "Publish Now" (two separate submit buttons, or a toggle)

**Design direction:**
- Clean form layout, similar to company creation
- Two-column layout on desktop: main fields left, metadata (location type, employment type, experience level) right
- Description field should be tall (at least 6 rows)
- Salary fields side by side with currency label ($)
- At the bottom: "Save as Draft" (secondary button) and "Publish Role" (primary button)

**Key behaviors:**
- `companyId` comes from the URL param
- `hiringManagerId` comes from persona context
- Inline validation (Zod)
- On success: toast "Role created!", redirect to the roles list
- Page title: "Create New Role"

---

## Step 6: Role Detail (HM View)

Create `src/app/hiring/company/[companyId]/roles/[roleId]/page.tsx`:

This is different from the candidate role detail — it shows management controls.

**Design direction:**
- Header: Role title, status badge, "Edit Status" dropdown
- Status actions:
  - Draft → "Publish" button
  - Published → "Close Role" button
  - Closed → "Reopen" button (sets back to published)
- Role metadata (same info as candidate view: location, salary, employment type, etc.)
- Full description
- "View Applications" button/link (prominent) with application count badge
- Application status summary bar: visual breakdown of application statuses (like a horizontal stacked bar or just counts)

**API needed:** **PATCH `/api/roles/[roleId]`** — Update role status

**Request body validated with `updateRoleStatusSchema`.**

**Key behaviors:**
- Status change shows confirmation dialog ("Are you sure you want to close this role?")
- On status change: toast notification, refresh the page data
- "View Applications" links to `/hiring/company/[companyId]/roles/[roleId]/applications`
- Page title: "{Role Title} — Manage | Job Board"

---

## Step 7: Applications Review

Create `src/app/hiring/company/[companyId]/roles/[roleId]/applications/page.tsx`:

This is where HMs review and manage applications for a specific role.

**API needed:** **GET `/api/applications?roleId=...`**

Update applications API to support:
- `roleId` filter
- Include candidate details (name, email, headline, skills, yearsExperience, linkedinUrl)
- Sort by `createdAt` descending (newest first)

**PATCH `/api/applications/[applicationId]`** — Update application status

**Design direction:**
- Page title: "Applications for {Role Title}" with count
- Filter tabs by status: "All" | "New" | "Reviewing" | "Interview" | "Accepted" | "Rejected" — with counts per tab
- Application cards (more detail than candidate's view):
  - Candidate name + avatar (initials fallback)
  - Candidate headline
  - Years of experience + skills tags
  - LinkedIn URL (clickable link)
  - Cover note (expandable)
  - Application status badge
  - "Applied X days ago"
  - Status action dropdown: move to Reviewing / Interview / Accepted / Rejected
  - If accepted: "Send Message" button (links to messaging — Phase 4)
- Empty state per tab

**Application Review Card component (`src/components/applications/application-review-card.tsx`):**
- More detailed than the candidate's application card
- Shows candidate's full profile info inline
- Has status change controls (dropdown or button group)

**Key behaviors:**
- Status change is immediate (optimistic update + API call)
- On status change: toast "Application moved to {status}"
- When changing to "Accepted", consider showing a brief confirmation: "Accept this application? This will allow you to message the candidate."
- Tab counts update in real-time after status changes
- LinkedIn URLs open in new tab

---

## Checklist Before Moving On

- [ ] HM lands on company selector after choosing persona
- [ ] Company cards show role count and new application count
- [ ] "Create New Company" flow works end-to-end
- [ ] New company appears in the selector immediately
- [ ] Company selection persists in persona context
- [ ] "Switch Company" returns to company selector
- [ ] Roles list shows all roles for the company with correct statuses
- [ ] Status filter tabs work with correct counts
- [ ] Application count badges are accurate
- [ ] "Create New Role" form validates and saves correctly
- [ ] "Save as Draft" and "Publish" create with correct status
- [ ] Role detail page shows management controls
- [ ] Status changes (publish, close, reopen) work with confirmation
- [ ] Applications page shows all applications for a role
- [ ] Candidate info (headline, skills, LinkedIn, cover note) is visible
- [ ] Status changes on applications work immediately
- [ ] Tab counts update after status changes
- [ ] Empty states and loading skeletons present on all pages
- [ ] Page titles are dynamic

---

## What's Next

Phase 4 builds the messaging system between HMs and accepted candidates.
