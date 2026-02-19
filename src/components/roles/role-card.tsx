import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  formatSalaryRange,
  formatRelativeTime,
  getInitials,
} from "@/lib/utils";
import { cn } from "@/lib/utils";

const LOCATION_LABELS: Record<string, string> = {
  onsite: "Onsite",
  remote: "Remote",
  hybrid: "Hybrid",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");
}

export interface RoleCardProps {
  role: {
    id: string;
    title: string;
    location: string;
    locationType: string;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryCurrency: string;
    employmentType: string;
    experienceLevel: string | null;
    createdAt: Date | string;
    company: { id: string; name: string; logoUrl: string | null };
  };
}

export function RoleCard({ role }: RoleCardProps) {
  const createdAt =
    typeof role.createdAt === "string"
      ? new Date(role.createdAt)
      : role.createdAt;

  return (
    <Link href={`/candidate/roles/${role.id}`}>
      <Card
        className={cn(
          "transition-all duration-150 hover:border-accent hover:bg-accent/50 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        )}
      >
        <CardHeader className="flex flex-row items-start gap-4 pb-2">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {getInitials(role.company.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {role.company.name}
            </p>
            <h3 className="font-semibold text-lg leading-tight">
              {role.title}
            </h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">
              {LOCATION_LABELS[role.locationType] ?? role.locationType}
            </Badge>
            <Badge variant="outline">{role.location}</Badge>
            <Badge variant="outline">
              {capitalize(role.employmentType)}
            </Badge>
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
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Posted {formatRelativeTime(createdAt)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
