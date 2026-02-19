import { Card, CardContent } from "@/components/ui/card";

export { RoleCardSkeleton } from "@/components/shared/role-card-skeleton";

export function ApplicationCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 bg-muted animate-pulse rounded" />
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FormSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        <div className="h-10 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        <div className="h-24 w-full bg-muted animate-pulse rounded" />
        <div className="h-10 w-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}

export function TableRowSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-5 w-48 bg-muted rounded" />
              <div className="h-5 w-16 bg-muted rounded-full" />
            </div>
            <div className="mt-2 h-4 w-full bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CompanyCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 bg-muted rounded" />
                <div className="h-4 w-24 bg-muted rounded" />
              </div>
            </div>
            <div className="mt-4 h-4 w-full bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function ThreadSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
      ))}
    </div>
  );
}
