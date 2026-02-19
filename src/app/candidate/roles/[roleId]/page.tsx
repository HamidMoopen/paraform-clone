"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePersona } from "@/providers/persona-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ApplyDialog } from "@/components/applications/apply-dialog";
import { DescriptionRenderer } from "@/components/shared/description-renderer";
import { RoleCardSkeleton } from "@/components/shared/role-card-skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/lib/constants";
import { CheckCircle2 } from "lucide-react";
import {
  formatSalaryRange,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

const LOCATION_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

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
  createdAt: string;
  company: {
    id: string;
    name: string;
    description: string | null;
    industry: string | null;
    location: string | null;
    website: string | null;
    logoUrl: string | null;
  };
  _count: { applications: number };
  hasApplied?: boolean;
  applicationStatus?: string | null;
}

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { persona } = usePersona();
  const roleId = params.roleId as string;
  const [role, setRole] = useState<RoleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const candidateId = persona?.type === "candidate" ? persona.id : null;

  const fetchRole = useCallback(() => {
    setLoading(true);
    setNotFound(false);
    setError(false);
    const params = candidateId ? `?candidateId=${candidateId}` : "";
    fetch(`/api/roles/${roleId}${params}`)
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(setRole)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [roleId, candidateId]);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  useEffect(() => {
    if (role)
      document.title = `${role.title} at ${role.company.name} | Jobaform`;
  }, [role]);

  const handleApplySuccess = () => {
    router.push("/candidate/applications");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <RoleCardSkeleton />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message="Failed to load role." onRetry={fetchRole} />;
  }

  if (notFound || !role) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center">
        <p className="text-muted-foreground">Role not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/candidate/roles">Back to roles</Link>
        </Button>
      </div>
    );
  }

  const createdAt = new Date(role.createdAt);
  const candidate =
    persona?.type === "candidate"
      ? {
          id: persona.id,
          name: persona.name,
          email: persona.email,
          linkedinUrl: null as string | null,
        }
      : null;

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(role.company.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {role.company.name}
              </p>
              <h1 className="text-2xl font-bold tracking-tight mt-0.5">
                {role.title}
              </h1>
            </div>
          </div>
          {candidate && !role.hasApplied && (
            <Button onClick={() => setApplyOpen(true)} size="lg">
              Apply Now
            </Button>
          )}
          {candidate && role.hasApplied && (
            <Button asChild variant="outline" size="lg">
              <Link href="/candidate/applications">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Applied{role.applicationStatus ? ` · ${APPLICATION_STATUS_LABELS[role.applicationStatus] ?? role.applicationStatus}` : ""}
              </Link>
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">
            {LOCATION_LABELS[role.locationType] ?? role.locationType}
          </Badge>
          <Badge variant="outline">{role.location}</Badge>
          <Badge variant="outline">{capitalize(role.employmentType)}</Badge>
          {role.experienceLevel && (
            <Badge variant="outline">
              {capitalize(role.experienceLevel)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {formatSalaryRange(
            role.salaryMin,
            role.salaryMax,
            role.salaryCurrency
          )}{" "}
          · Posted {formatRelativeTime(createdAt)}
        </p>
      </header>

      {(role.company.description || role.company.industry || role.company.website) && (
        <section className="space-y-1">
          <h2 className="text-lg font-semibold">About {role.company.name}</h2>
          {role.company.description && (
            <p className="text-sm text-muted-foreground">
              {role.company.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm">
            {role.company.industry && (
              <span className="text-muted-foreground">{role.company.industry}</span>
            )}
            {role.company.website && (
              <a
                href={role.company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Visit website
              </a>
            )}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Description</h2>
        <DescriptionRenderer text={role.description} />
      </section>

      {candidate && !role.hasApplied && (
        <ApplyDialog
          open={applyOpen}
          onOpenChange={setApplyOpen}
          roleId={role.id}
          candidate={candidate}
          onSuccess={handleApplySuccess}
        />
      )}
    </div>
  );
}
