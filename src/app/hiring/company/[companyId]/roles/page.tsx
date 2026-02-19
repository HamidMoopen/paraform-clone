"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [companyName, setCompanyName] = useState<string>("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(() => {
    if (!companyId) return;
    setLoading(true);
    fetch(`/api/roles?companyId=${companyId}&includeAll=true`)
      .then((res) => res.json())
      .then((data) => {
        setRoles(data.roles ?? []);
        const first = (data.roles ?? [])[0];
        if (first?.company?.name) setCompanyName(first.company.name);
        else
          fetch(`/api/companies?hiringManagerId=${persona?.id ?? ""}`)
            .then((r) => r.json())
            .then((d) => {
              const c = (d.companies ?? []).find((x: { id: string }) => x.id === companyId);
              setCompanyName(c?.name ?? "Company");
            });
      })
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, [companyId, persona?.id]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

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

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="mt-2 h-4 w-full bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
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
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {tab === "all"
                        ? "No roles yet. Create your first role."
                        : `No ${tab} roles.`}
                      {tab === "all" && (
                        <div className="mt-4">
                          <Button asChild variant="outline">
                            <Link href={`/hiring/company/${companyId}/roles/new`}>
                              Create New Role
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                            "transition-colors hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
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
