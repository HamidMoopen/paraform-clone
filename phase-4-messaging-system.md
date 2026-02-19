# Phase 4: Messaging System

## Goal
Build a simple message log between hiring managers and accepted candidates. No real-time — just a basic thread view with manual refresh. By the end of this phase, HMs and candidates can exchange messages on accepted applications.

---

## Step 1: Messages API

Create `src/app/api/messages/route.ts`:

### GET `/api/messages`

Supports two use cases:

**1. Get messages for a specific application:**
- Query param: `applicationId`
- Returns all messages for that application, ordered by `createdAt ASC` (oldest first — chat order)
- Include sender info (name, avatar)

**Response:**
```json
{
  "messages": [
    {
      "id": "...",
      "content": "Hi Sam! We loved your application...",
      "createdAt": "...",
      "sender": {
        "type": "hiring-manager",
        "id": "...",
        "name": "Priya Patel",
        "avatarUrl": "..."
      }
    },
    {
      "id": "...",
      "content": "Thanks Priya! I'm thrilled...",
      "createdAt": "...",
      "sender": {
        "type": "candidate",
        "id": "...",
        "name": "Sam Taylor",
        "avatarUrl": "..."
      }
    }
  ]
}
```

**2. Get all message threads for a user:**
- Query param: `hiringManagerId` OR `candidateId`
- Returns a list of applications that have messages (or accepted status), grouped as "threads"
- Each thread includes: application ID, role title, company name, other party's name, last message preview, last message timestamp, unread indicator (optional — can be based on whether the last message was from the other party)

**Response:**
```json
{
  "threads": [
    {
      "applicationId": "...",
      "roleTitle": "Full-Stack Engineer",
      "companyName": "HealthStack",
      "otherParty": {
        "name": "Sam Taylor",
        "avatarUrl": "..."
      },
      "lastMessage": {
        "content": "Thursday at 2pm CT works perfectly...",
        "createdAt": "...",
        "isFromMe": false
      },
      "messageCount": 3
    }
  ]
}
```

### POST `/api/messages`

**Request body validated with `createMessageSchema`:**
```json
{
  "applicationId": "...",
  "content": "Message text here...",
  "hiringManagerId": "...",   // OR
  "candidateId": "..."        // exactly one
}
```

**Backend validation:**
- Application exists
- Application status is "accepted" (messaging only available for accepted applications)
- Sender is either the HM who owns the role OR the candidate who submitted the application
- Message content is non-empty

**Response:** Created message with 201 status.

---

## Step 2: Message Thread View (Shared Component)

Create `src/components/messages/message-thread.tsx`:

This is a shared component used by both HM and candidate message views.

**Design direction:**
- Chat-like layout (messages stacked vertically)
- Messages from the current user: right-aligned, colored background (e.g., blue)
- Messages from the other party: left-aligned, neutral background (e.g., gray)
- Each message shows:
  - Sender name (small, above the bubble)
  - Message content
  - Timestamp (small, below the bubble)
  - Avatar/initials next to the bubble
- Message input at the bottom:
  - Textarea (auto-expanding, 1-3 rows)
  - "Send" button (disabled when empty)
  - Character count (max 2000)
- Loading state while fetching messages

**Key behaviors:**
- Messages are fetched on mount and can be manually refreshed with a "Refresh" button or auto-poll every 30 seconds (simple setInterval — this is the "not real-time" approach)
- New message appears at the bottom after sending
- Scroll to bottom on load and after sending a message
- Optimistic update: show the message immediately in the UI, then confirm with API
- Error handling: if send fails, show the message in an error state with a "retry" option

---

## Step 3: HM Messages Page

Create `src/app/hiring/messages/page.tsx`:

**Design direction:**
- Two-panel layout (like a basic email client):
  - Left panel: thread list (applications with messages)
  - Right panel: selected thread's message view
- On mobile/narrow: thread list is full-width, clicking opens the thread (navigate to a sub-page or expand)

**Left panel (thread list):**
- Each thread shows:
  - Candidate name + avatar
  - Role title
  - Last message preview (truncated)
  - Timestamp of last message
  - Message count badge
- Active thread is highlighted
- Sorted by most recent message first

**Right panel:**
- Uses the `MessageThread` shared component
- Header shows: candidate name, role title, application status badge
- Link to view the full application

**Key behaviors:**
- Scoped to the current HM persona (fetch threads where `hiringManagerId` matches)
- If no threads exist: empty state "No messages yet. Accept an application to start a conversation."
- Clicking a thread in the left panel loads its messages in the right panel
- URL updates with selected thread: `/hiring/messages?thread=[applicationId]`

**Navigation:**
- Add "Messages" link to HM nav bar (with unread count badge if desired — can be a stretch goal)

---

## Step 4: Candidate Messages Access

Candidates access messages from their "My Applications" page — they don't need a separate messages section.

**Update the application card (`src/components/applications/application-card.tsx`):**
- For accepted applications, add a "Message" button
- Clicking "Message" opens a dialog/modal with the `MessageThread` component
- OR, create a dedicated page: `/candidate/applications/[applicationId]/messages`

**Recommended approach:** Dialog/modal is simpler and keeps the candidate in context. Create:

`src/components/messages/message-dialog.tsx`:
- Full-screen dialog (or large modal) with the `MessageThread` component
- Header shows: role title, company name, HM name
- Close button returns to applications list

**Key behaviors:**
- Only shown for applications with status "accepted"
- Fetch messages for the specific application
- Send messages as the candidate

---

## Step 5: Entry Points for Messaging

Make sure messaging is accessible from the right places:

**From HM applications review (Phase 3):**
- On accepted applications, the "Send Message" button should navigate to `/hiring/messages?thread=[applicationId]` or open inline

**From HM role detail:**
- If there are accepted applications, show a "Messages" link

**From candidate applications list:**
- "Message" button on accepted application cards → opens message dialog

---

## Checklist Before Moving On

- [ ] Messages API returns messages for an application in chronological order
- [ ] Messages API returns thread list for HMs and candidates
- [ ] Sending a message works and shows immediately in the thread
- [ ] HM messages page shows all threads with correct preview info
- [ ] Selecting a thread loads the full conversation
- [ ] Candidates can message from accepted applications
- [ ] Chat-style layout: own messages right-aligned, others left-aligned
- [ ] Timestamps displayed on each message
- [ ] Empty state when no messages exist
- [ ] Character limit enforced on message input
- [ ] Loading states while fetching messages
- [ ] Messaging is only available for accepted applications (enforced in API and UI)
- [ ] Scroll to bottom on load and after sending
- [ ] "Messages" link added to HM navigation

---

## What's Next

Phase 5 is the polish pass — responsive design, loading states audit, form validation audit, empty states, favicon, page titles, and overall visual cohesion.
