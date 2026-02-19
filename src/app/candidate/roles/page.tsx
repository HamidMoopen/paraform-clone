"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { usePersona } from "@/providers/persona-provider";
import { RoleCard } from "@/components/roles/role-card";
import { RoleFilters } from "@/components/roles/role-filters";
import { RoleCardSkeleton } from "@/components/shared/role-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";

interface Company {
  id: string;
  name: string;
}

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
  createdAt: string;
  company: { id: string; name: string; logoUrl: string | null };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function CandidateRolesPage() {
  useEffect(() => { document.title = "Browse Roles | Job Board"; }, []);
  const searchParams = useSearchParams();
  const { persona } = usePersona();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const candidateId = persona?.type === "candidate" ? persona.id : undefined;

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => setCompanies(data.companies ?? []))
      .catch(() => setCompanies([]));
  }, []);

  const fetchRoles = useCallback(() => {
    if (!candidateId) return;
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    params.set("candidateId", candidateId);
    params.set("page", searchParams.get("page") ?? "1");
    params.set("limit", "10");
    const company = searchParams.get("company");
    const location = searchParams.get("location");
    const salaryMin = searchParams.get("salaryMin");
    const salaryMax = searchParams.get("salaryMax");
    const search = searchParams.get("search");
    if (company) params.set("company", company);
    if (location) params.set("location", location);
    if (salaryMin) params.set("salaryMin", salaryMin);
    if (salaryMax) params.set("salaryMax", salaryMax);
    if (search) params.set("search", search);

    fetch(`/api/roles?${params.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch roles");
        return res.json();
      })
      .then((data) => {
        setRoles(data.roles ?? []);
        setPagination(data.pagination ?? null);
      })
      .catch(() => {
        setError("Failed to load roles.");
        setRoles([]);
        setPagination(null);
      })
      .finally(() => setLoading(false));
  }, [candidateId, searchParams]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const page = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 0;
  const total = pagination?.total ?? 0;
  const hasFilters = [
    searchParams.get("company"),
    searchParams.get("location"),
    searchParams.get("salaryMin"),
    searchParams.get("salaryMax"),
    searchParams.get("search"),
  ].some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse Open Roles</h1>
        <p className="text-muted-foreground mt-1">
          Find your next opportunity
        </p>
      </div>

      <RoleFilters companies={companies} />

      {error && (
        <ErrorState message={error} onRetry={fetchRoles} />
      )}

      {!error && loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <RoleCardSkeleton key={i} />
          ))}
        </div>
      ) : roles.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No roles match your filters" : "No open roles right now"}
          description={hasFilters ? undefined : "Check back soon!"}
          action={hasFilters ? { label: "Clear filters", href: "/candidate/roles" } : undefined}
        />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {roles.length} of {total} roles
          </p>
          <div className="space-y-4">
            {roles.map((role) => (
              <RoleCard key={role.id} role={role} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                asChild={page > 1}
              >
                {page > 1 ? (
                  <Link
                    href={`/candidate/roles?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: String(page - 1),
                    })}`}
                  >
                    Previous
                  </Link>
                ) : (
                  <span>Previous</span>
                )}
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                asChild={page < totalPages}
              >
                {page < totalPages ? (
                  <Link
                    href={`/candidate/roles?${new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      page: String(page + 1),
                    })}`}
                  >
                    Next
                  </Link>
                ) : (
                  <span>Next</span>
                )}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
