"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableRowSkeleton } from "@/components/shared/page-skeleton";
import {
  ROLE_STATUS_LABELS,
  ROLE_STATUS_COLORS,
  APPLICATION_STATUS_LABELS,
} from "@/lib/constants";
import { formatSalaryRange, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

interface Role {
  id: string;
  title: string;
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
  company: { id: string; name: string; logoUrl: string | null };
  _count: { applications: number };
  applications?: { status: string }[];
}

function getApplicationSummary(applications: { status: string }[] = []) {
  const counts: Record<string, number> = {};
  for (const a of applications) {
    counts[a.status] = (counts[a.status] ?? 0) + 1;
  }
  const parts = ["new", "reviewing", "interview"]
    .filter((s) => (counts[s] ?? 0) > 0)
    .map((s) => `${counts[s]} ${APPLICATION_STATUS_LABELS[s]?.toLowerCase() ?? s}`);
  return parts.join(" · ") || "No applications";
}

export default function HiringCompanyRolesPage() {
  const params = useParams();
  const { persona } = usePersona();
  const companyId = params.companyId as string;
  const companyName = persona?.type === "hiring-manager" ? persona.companyName : "";
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/roles?companyId=${companyId}&includeAll=true`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setRoles(data.roles ?? []);
      })
      .catch(() => {
        setError("Failed to load roles.");
        setRoles([]);
      })
      .finally(() => setLoading(false));
  }, [companyId]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  useEffect(() => {
    document.title = companyName
      ? `Roles \u2014 ${companyName} | Jobaform`
      : "Roles | Jobaform";
  }, [companyName]);

  if (persona?.type !== "hiring-manager") return null;

  const allRoles = roles;
  const published = allRoles.filter((r) => r.status === "published" && !r.deletedAt);
  const draft = allRoles.filter((r) => r.status === "draft");
  const closed = allRoles.filter((r) => r.status === "closed" || r.deletedAt);

  const filterByTab: Record<string, Role[]> = {
    all: allRoles,
    published,
    draft,
    closed,
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Roles {companyName ? `at ${companyName}` : ""}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage job postings and view applications.
          </p>
        </div>
        <Button asChild>
          <Link href={`/hiring/company/${companyId}/roles/new`}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Role
          </Link>
        </Button>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={fetchRoles} />
        </div>
      ) : loading ? (
        <div className="mt-6">
          <TableRowSkeleton />
        </div>
      ) : (
        <Tabs defaultValue="all" className="mt-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({allRoles.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({published.length})
            </TabsTrigger>
            <TabsTrigger value="draft">Draft ({draft.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          </TabsList>
          {(["all", "published", "draft", "closed"] as const).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-3">
                {filterByTab[tab].length === 0 ? (
                  <EmptyState
                    title={tab === "all" ? "No roles yet" : `No ${tab} roles`}
                    description={tab === "all" ? "Create your first role to get started." : undefined}
                    action={tab === "all" ? { label: "Create New Role", href: `/hiring/company/${companyId}/roles/new` } : undefined}
                  />
                ) : (
                  filterByTab[tab].map((role) => {
                    const createdAt =
                      typeof role.createdAt === "string"
                        ? new Date(role.createdAt)
                        : role.createdAt;
                    return (
                      <Link
                        key={role.id}
                        href={`/hiring/company/${companyId}/roles/${role.id}`}
                      >
                        <Card
                          className={cn(
                            "transition-all duration-150 hover:border-accent hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                          )}
                        >
                          <CardContent className="p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <h2 className="font-semibold">{role.title}</h2>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    ROLE_STATUS_COLORS[role.status] ??
                                      "bg-muted text-muted-foreground"
                                  )}
                                >
                                  {ROLE_STATUS_LABELS[role.status] ?? role.status}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                Posted {formatRelativeTime(createdAt)}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                              <span>
                                {role.location} ·{" "}
                                {role.locationType.charAt(0).toUpperCase() +
                                  role.locationType.slice(1)}
                              </span>
                              <span>
                                {formatSalaryRange(
                                  role.salaryMin,
                                  role.salaryMax,
                                  role.salaryCurrency
                                )}
                              </span>
                              <span>
                                {role._count.applications} application
                                {role._count.applications !== 1 ? "s" : ""}
                              </span>
                              {role.applications && role.applications.length > 0 && (
                                <span>
                                  {getApplicationSummary(role.applications)}
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
