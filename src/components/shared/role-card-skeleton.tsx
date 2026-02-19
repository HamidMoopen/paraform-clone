import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function RoleCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <div className="h-10 w-10 shrink-0 rounded-full bg-muted animate-pulse" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
          <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-3 w-32 bg-muted animate-pulse rounded" />
        <div className="h-3 w-24 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );
}
