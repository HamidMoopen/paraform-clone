"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePersona } from "@/providers/persona-provider";
import { ApplicationCard } from "@/components/applications/application-card";
import { MessageDialog } from "@/components/messages/message-dialog";
import { ApplicationCardSkeleton } from "@/components/shared/page-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

interface ApplicationItem {
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
    hiringManager?: { id: string; name: string; avatarUrl: string | null };
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CandidateApplicationsPage() {
  useEffect(() => { document.title = "My Applications | Jobaform"; }, []);
  const { persona } = usePersona();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageApplicationId, setMessageApplicationId] = useState<
    string | null
  >(null);

  const candidateId = persona?.type === "candidate" ? persona.id : undefined;

  const fetchApplications = useCallback(() => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/applications?candidateId=${candidateId}&page=1&limit=10`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setApplications(data.applications ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch(() => {
        setError("Failed to load applications.");
        setApplications([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [candidateId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;
  const page = pagination?.page ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-1">
          Track your application status
        </p>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchApplications} />
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ApplicationCardSkeleton key={i} />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title="You haven't applied to any roles yet"
          action={{ label: "Browse Roles", href: "/candidate/roles" }}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} application{total !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onMessageClick={
                  ["interview", "accepted"].includes(app.status)
                    ? () => setMessageApplicationId(app.id)
                    : undefined
                }
              />
            ))}
          </div>
          {messageApplicationId && persona?.type === "candidate" && (() => {
            const app = applications.find(
              (a) => a.id === messageApplicationId
            );
            if (!app) return null;
            return (
              <MessageDialog
                open={true}
                onOpenChange={(open) => !open && setMessageApplicationId(null)}
                applicationId={app.id}
                roleTitle={app.role.title}
                companyName={app.role.company.name}
                otherPartyName={app.role.hiringManager?.name ?? "Hiring Manager"}
                candidateId={persona.id}
              />
            );
          })()}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
