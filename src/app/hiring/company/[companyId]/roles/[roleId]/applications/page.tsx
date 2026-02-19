"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApplicationReviewCard } from "@/components/applications/application-review-card";
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

  const fetchApplications = useCallback(() => {
    if (!roleId) return;
    setLoading(true);
    fetch(`/api/applications?roleId=${roleId}`)
      .then((res) => res.json())
      .then((data) => {
        const list = data.applications ?? [];
        setApplications(list);
        if (list[0]?.role?.title) setRoleTitle(list[0].role.title);
        else
          fetch(`/api/roles/${roleId}?forHm=true`)
            .then((r) => r.json())
            .then((r) => setRoleTitle(r.title ?? "Role"));
      })
      .catch(() => setApplications([]))
      .finally(() => setLoading(false));
  }, [roleId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

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

      {loading ? (
        <div className="mt-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-12 flex gap-3">
                  <div className="h-12 w-12 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                  <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                      {tab === "all"
                        ? "No applications yet."
                        : `No ${APPLICATION_STATUS_LABELS[tab] ?? tab} applications.`}
                    </CardContent>
                  </Card>
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
