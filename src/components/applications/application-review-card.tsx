"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatRelativeTime, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, ExternalLink, MessageCircle } from "lucide-react";

const STATUS_OPTIONS = [
  "reviewing",
  "interview",
  "accepted",
  "rejected",
] as const;

export interface ApplicationReviewCardProps {
  application: {
    id: string;
    status: string;
    coverNote: string | null;
    createdAt: string;
    candidate: {
      id: string;
      name: string;
      email: string;
      headline: string | null;
      skills: string | null;
      yearsExperience: number | null;
      linkedinUrl: string | null;
      avatarUrl: string | null;
    };
    role?: { id: string; title: string; companyId: string };
  };
  onStatusChange: (newStatus: string) => void;
}

export function ApplicationReviewCard({
  application,
  onStatusChange,
}: ApplicationReviewCardProps) {
  const [coverExpanded, setCoverExpanded] = useState(false);
  const createdAt =
    typeof application.createdAt === "string"
      ? new Date(application.createdAt)
      : new Date(application.createdAt);
  const c = application.candidate;
  const hasCover = !!application.coverNote?.trim();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar className="h-12 w-12 rounded-lg shrink-0">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm">
                {c.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.avatarUrl}
                    alt=""
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  getInitials(c.name)
                )}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="font-semibold truncate">{c.name}</p>
              {c.headline && (
                <p className="text-sm text-muted-foreground truncate">
                  {c.headline}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.yearsExperience != null
                  ? `${c.yearsExperience} years experience`
                  : ""}
                {c.skills?.trim() && (
                  <span className="ml-1">
                    · {c.skills.split(",").slice(0, 2).join(", ")}
                  </span>
                )}
              </p>
              {c.linkedinUrl && (
                <a
                  href={c.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                >
                  LinkedIn <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:shrink-0">
            <Badge
              className={cn(
                "text-xs",
                APPLICATION_STATUS_COLORS[application.status] ??
                  "bg-muted text-muted-foreground"
              )}
            >
              {APPLICATION_STATUS_LABELS[application.status] ??
                application.status}
            </Badge>
            <Select
              value={application.status}
              onValueChange={(v) => v !== application.status && onStatusChange(v)}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">
                  {APPLICATION_STATUS_LABELS.new}
                </SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {APPLICATION_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {application.status === "accepted" && (
              <Button variant="outline" size="sm" asChild>
                <Link
                  href={`/hiring/messages?thread=${application.id}`}
                  className="text-xs"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Send Message
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Applied {formatRelativeTime(createdAt)}
        </p>
        {hasCover && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setCoverExpanded((x) => !x)}
              className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
            >
              {coverExpanded ? (
                <>
                  Hide cover note <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  View cover note <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
            {coverExpanded && (
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap border rounded-md p-3 bg-muted/30">
                {application.coverNote}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
