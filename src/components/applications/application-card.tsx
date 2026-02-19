"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatSalaryRange, formatRelativeTime, getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const COVER_PREVIEW_LENGTH = 120;

interface ApplicationCardProps {
  application: {
    id: string;
    status: string;
    coverNote: string | null;
    createdAt: string;
    role: {
      id: string;
      title: string;
      salaryMin: number | null;
      salaryMax: number | null;
      salaryCurrency: string;
      company: { id: string; name: string; logoUrl: string | null };
    };
  };
}

export function ApplicationCard({ application }: ApplicationCardProps) {
  const [expandNote, setExpandNote] = useState(false);
  const createdAt = new Date(application.createdAt);
  const coverNote = application.coverNote?.trim() ?? "";
  const showMessage = application.status === "accepted";

  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {getInitials(application.role.company.name)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/candidate/roles/${application.role.id}`}
              className="font-semibold text-lg hover:underline"
            >
              {application.role.title}
            </Link>
            <Badge
              className={cn(
                "shrink-0",
                APPLICATION_STATUS_COLORS[application.status]
              )}
            >
              {APPLICATION_STATUS_LABELS[application.status] ??
                application.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {application.role.company.name} ·{" "}
            {formatSalaryRange(
              application.role.salaryMin,
              application.role.salaryMax,
              application.role.salaryCurrency
            )}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <p className="text-xs text-muted-foreground">
          Applied {formatRelativeTime(createdAt)}
        </p>
        {coverNote && (
          <div className="text-sm">
            {expandNote ? (
              <p className="whitespace-pre-wrap">{coverNote}</p>
            ) : (
              <p className="text-muted-foreground line-clamp-2">
                {coverNote.slice(0, COVER_PREVIEW_LENGTH)}
                {coverNote.length > COVER_PREVIEW_LENGTH ? "…" : ""}
              </p>
            )}
            {coverNote.length > COVER_PREVIEW_LENGTH && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-xs mt-1"
                onClick={() => setExpandNote(!expandNote)}
              >
                {expandNote ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        )}
        {showMessage && (
          <Button variant="outline" size="sm" asChild>
            <Link href="#">Message</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
