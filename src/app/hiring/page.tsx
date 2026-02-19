"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { CompanyCardSkeleton } from "@/components/shared/page-skeleton";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Building2, Plus } from "lucide-react";

interface CompanyCard {
  id: string;
  name: string;
  description?: string | null;
  industry?: string | null;
  location?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  roleCount: number;
  newApplicationCount: number;
}

export default function HiringDashboardPage() {
  useEffect(() => { document.title = "Your Companies | Job Board"; }, []);
  const router = useRouter();
  const { persona, setActiveCompany } = usePersona();
  const [companies, setCompanies] = useState<CompanyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanies = useCallback(() => {
    if (persona?.type !== "hiring-manager") return;
    setLoading(true);
    setError(null);
    fetch(`/api/companies?hiringManagerId=${persona.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setCompanies(data.companies ?? []);
      })
      .catch(() => {
        setError("Failed to load companies.");
        setCompanies([]);
      })
      .finally(() => setLoading(false));
  }, [persona?.id, persona?.type]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSelectCompany = (companyId: string) => {
    setActiveCompany(companyId);
    router.push(`/hiring/company/${companyId}/roles`);
  };

  if (persona?.type !== "hiring-manager") return null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Your Companies</h1>
      <p className="text-muted-foreground mt-1">
        Select a company to manage roles and applications.
      </p>

      {error ? (
        <div className="mt-8">
          <ErrorState message={error} onRetry={fetchCompanies} />
        </div>
      ) : loading ? (
        <div className="mt-8">
          <CompanyCardSkeleton />
        </div>
      ) : companies.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={Building2}
            title="You don't have any companies yet"
            description="Create your first company to start posting roles."
            action={{ label: "Create your first company", href: "/hiring/new-company" }}
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
              )}
              onClick={() => handleSelectCompany(company.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-sm font-medium">
                      {company.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={company.logoUrl}
                          alt=""
                          className="h-full w-full rounded-lg object-cover"
                        />
                      ) : (
                        getInitials(company.name)
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold truncate">{company.name}</h2>
                    {(company.industry || company.location) && (
                      <p className="text-sm text-muted-foreground truncate">
                        {[company.industry, company.location]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  {company.roleCount} active role
                  {company.roleCount !== 1 ? "s" : ""} ·{" "}
                  {company.newApplicationCount} new application
                  {company.newApplicationCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          ))}

          <Link href="/hiring/new-company">
            <Card
              className={cn(
                "h-full min-h-[140px] border-dashed border-2 transition-colors hover:border-primary/50 hover:bg-muted/50 flex items-center justify-center"
              )}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
                <div className="rounded-full bg-muted p-3">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  Create New Company
                </span>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
