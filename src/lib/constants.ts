export const ROLE_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CLOSED: "closed",
} as const;

export const APPLICATION_STATUS = {
  NEW: "new",
  REVIEWING: "reviewing",
  INTERVIEW: "interview",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export const LOCATION_TYPE = {
  ONSITE: "onsite",
  REMOTE: "remote",
  HYBRID: "hybrid",
} as const;

export const EMPLOYMENT_TYPE = {
  FULL_TIME: "full-time",
  PART_TIME: "part-time",
  CONTRACT: "contract",
  INTERNSHIP: "internship",
} as const;

export const EXPERIENCE_LEVEL = {
  ENTRY: "entry",
  MID: "mid",
  SENIOR: "senior",
  LEAD: "lead",
} as const;

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  new: "New",
  reviewing: "Reviewing",
  interview: "Interview",
  accepted: "Accepted",
  rejected: "Rejected",
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-500/15 text-blue-400",
  reviewing: "bg-yellow-500/15 text-yellow-400",
  interview: "bg-purple-500/15 text-purple-400",
  accepted: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

export const ROLE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  published: "Published",
  closed: "Closed",
};

export const ROLE_STATUS_COLORS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-green-500/15 text-green-400",
  closed: "bg-red-500/15 text-red-400",
};
