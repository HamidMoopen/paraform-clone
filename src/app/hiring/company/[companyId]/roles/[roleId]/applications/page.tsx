"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationReviewCard } from "@/components/applications/application-review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ApplicationCardSkeleton } from "@/components/shared/page-skeleton";
import { APPLICATION_STATUS_LABELS } from "@/lib/constants";

interface Application {
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
}

export default function HiringRoleApplicationsPage() {
  const params = useParams();
  const { persona } = usePersona();
  const companyId = params.companyId as string;
  const roleId = params.roleId as string;
  const [applications, setApplications] = useState<Application[]>([]);
  const [roleTitle, setRoleTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApplications = useCallback(() => {
    if (!roleId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/applications?roleId=${roleId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        const list = data.applications ?? [];
        setApplications(list);
        if (list[0]?.role?.title) setRoleTitle(list[0].role.title);
        else
          fetch(`/api/roles/${roleId}?forHm=true`)
            .then((r) => r.json())
            .then((r) => setRoleTitle(r.title ?? "Role"));
      })
      .catch(() => {
        setError("Failed to load applications.");
        setApplications([]);
      })
      .finally(() => setLoading(false));
  }, [roleId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    document.title = roleTitle
      ? `Applications \u2014 ${roleTitle} | Jobaform`
      : "Applications | Jobaform";
  }, [roleTitle]);

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    const prev = applications.find((a) => a.id === applicationId);
    if (!prev) return;
    setApplications((list) =>
      list.map((a) =>
        a.id === applicationId ? { ...a, status: newStatus } : a
      )
    );
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Failed to update");
        setApplications((list) =>
          list.map((a) => (a.id === applicationId ? { ...a, status: prev.status } : a))
        );
        return;
      }
      toast.success(`Application moved to ${APPLICATION_STATUS_LABELS[newStatus] ?? newStatus}`);
      fetchApplications();
    } catch {
      toast.error("Failed to update");
      setApplications((list) =>
        list.map((a) => (a.id === applicationId ? { ...a, status: prev.status } : a))
      );
    }
  };

  if (persona?.type !== "hiring-manager") return null;

  const all = applications;
  const byStatus: Record<string, Application[]> = {
    all,
    new: all.filter((a) => a.status === "new"),
    reviewing: all.filter((a) => a.status === "reviewing"),
    interview: all.filter((a) => a.status === "interview"),
    accepted: all.filter((a) => a.status === "accepted"),
    rejected: all.filter((a) => a.status === "rejected"),
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/hiring/company/${companyId}/roles/${roleId}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to role
        </Link>
      </div>
      <h1 className="text-2xl font-bold tracking-tight">
        Applications {roleTitle ? `· ${roleTitle}` : ""}
      </h1>
      <p className="text-muted-foreground mt-1">
        Review and update application status.
      </p>

      {error ? (
        <div className="mt-6">
          <ErrorState message={error} onRetry={fetchApplications} />
        </div>
      ) : loading ? (
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="all">All ({all.length})</TabsTrigger>
            <TabsTrigger value="new">New ({byStatus.new.length})</TabsTrigger>
            <TabsTrigger value="reviewing">
              Reviewing ({byStatus.reviewing.length})
            </TabsTrigger>
            <TabsTrigger value="interview">
              Interview ({byStatus.interview.length})
            </TabsTrigger>
            <TabsTrigger value="accepted">
              Accepted ({byStatus.accepted.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected ({byStatus.rejected.length})
            </TabsTrigger>
          </TabsList>
          {(
            [
              "all",
              "new",
              "reviewing",
              "interview",
              "accepted",
              "rejected",
            ] as const
          ).map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-4">
              <div className="space-y-4">
                {byStatus[tab].length === 0 ? (
                  <EmptyState
                    title={tab === "all"
                      ? "No applications received yet"
                      : `No ${APPLICATION_STATUS_LABELS[tab]?.toLowerCase() ?? tab} applications`}
                    description={tab === "all" ? "Share your role to get candidates!" : undefined}
                  />
                ) : (
                  byStatus[tab].map((app) => (
                    <ApplicationReviewCard
                      key={app.id}
                      application={app}
                      onStatusChange={(newStatus) =>
                        handleStatusChange(app.id, newStatus)
                      }
                    />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
