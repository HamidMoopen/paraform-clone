"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePersona } from "@/providers/persona-provider";
import { ApplicationCard } from "@/components/applications/application-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CandidateApplicationsPage() {
  const { persona } = usePersona();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const candidateId = persona?.type === "candidate" ? persona.id : undefined;

  const fetchApplications = useCallback(() => {
    if (!candidateId) return;
    setLoading(true);
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 w-1/3 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/4 bg-muted animate-pulse rounded mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t applied to any roles yet.
            </p>
            <Button asChild className="mt-4">
              <Link href="/candidate/roles">Browse Roles</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            {total} application{total !== 1 ? "s" : ""}
          </p>
          <div className="space-y-4">
            {applications.map((app) => (
              <ApplicationCard key={app.id} application={app} />
            ))}
          </div>
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
