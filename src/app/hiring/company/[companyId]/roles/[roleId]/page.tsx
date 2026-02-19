"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ROLE_STATUS_LABELS,
  ROLE_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface RoleDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  locationType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string;
  employmentType: string;
  experienceLevel: string | null;
  status: string;
  deletedAt: string | null;
  createdAt: string;
  company: { id: string; name: string };
  _count: { applications: number };
  applications?: { status: string }[];
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

function getApplicationSummary(applications: { status: string }[] = []) {
  const counts: Record<string, number> = {};
  for (const a of applications) {
    counts[a.status] = (counts[a.status] ?? 0) + 1;
  }
  return ["new", "reviewing", "interview", "accepted", "rejected"]
    .filter((s) => (counts[s] ?? 0) > 0)
    .map(
      (s) =>
        `${counts[s]} ${APPLICATION_STATUS_LABELS[s]?.toLowerCase() ?? s}`
    )
    .join(" · ");
}

export default function HiringRoleDetailPage() {
  const params = useParams();
  const { persona } = usePersona();
  const companyId = params.companyId as string;
  const roleId = params.roleId as string;
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<
    { status: "published" | "closed" } | null
  >(null);
  const [updating, setUpdating] = useState(false);

  const fetchRole = useCallback(() => {
    if (!roleId) return;
    setLoading(true);
    fetch(`/api/roles/${roleId}?forHm=true`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setRole)
      .catch(() => setRole(null))
      .finally(() => setLoading(false));
  }, [roleId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  const handleStatusChange = async (newStatus: "draft" | "published" | "closed") => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/roles/${roleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to update role");
        return;
      }
      toast.success(
        newStatus === "published"
          ? "Role published"
          : newStatus === "closed"
            ? "Role closed"
            : "Role reopened"
      );
      setConfirmAction(null);
      fetchRole();
    } finally {
      setUpdating(false);
    }
  };

  if (persona?.type !== "hiring-manager") return null;

  if (loading || !role) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const createdAt =
    typeof role.createdAt === "string"
      ? new Date(role.createdAt)
      : new Date(role.createdAt);
  const applicationSummary = getApplicationSummary(role.applications);
  const isClosed = role.status === "closed" || role.deletedAt;

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/hiring/company/${companyId}/roles`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to roles
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{role.title}</h1>
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                ROLE_STATUS_COLORS[role.status] ?? "bg-muted text-muted-foreground"
              )}
            >
              {ROLE_STATUS_LABELS[role.status] ?? role.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Posted {formatRelativeTime(createdAt)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {role.status === "draft" && (
            <Button
              onClick={() => setConfirmAction({ status: "published" })}
              disabled={updating}
            >
              Publish
            </Button>
          )}
          {role.status === "published" && !role.deletedAt && (
            <Button
              variant="destructive"
              onClick={() => setConfirmAction({ status: "closed" })}
              disabled={updating}
            >
              Close role
            </Button>
          )}
          {isClosed && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange("published")}
              disabled={updating}
            >
              Reopen
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Details
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                {role.location} · {capitalize(role.locationType)}
              </li>
              <li>
                {formatSalaryRange(
                  role.salaryMin,
                  role.salaryMax,
                  role.salaryCurrency
                )}
              </li>
              <li>{capitalize(role.employmentType)}</li>
              {role.experienceLevel && (
                <li>{capitalize(role.experienceLevel)}</li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Applications
            </h3>
            <p className="mt-2 text-sm">
              {role._count.applications} total
              {applicationSummary ? ` · ${applicationSummary}` : ""}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Button asChild>
                <Link
                  href={`/hiring/company/${companyId}/roles/${roleId}/applications`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Applications ({role._count.applications})
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/hiring/messages">Messages</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Description
          </h3>
          <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
            {role.description}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.status === "published"
                ? "Publish this role?"
                : "Close this role?"}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.status === "published"
                ? "The role will be visible to candidates and they can apply."
                : "The role will be hidden from candidates. You can reopen it later."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              disabled={updating}
              onClick={() =>
                confirmAction &&
                handleStatusChange(confirmAction.status)
              }
            >
              {updating
                ? "Updating…"
                : confirmAction?.status === "published"
                  ? "Publish"
                  : "Close role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
