"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface PersonaCardProps {
  name: string;
  descriptor: string;
  companyNames?: string[];
  onClick: () => void;
  className?: string;
}

export function PersonaCard({
  name,
  descriptor,
  companyNames,
  onClick,
  className,
}: PersonaCardProps) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-colors hover:bg-accent/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-0.5">
          <p className="font-semibold leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">{descriptor}</p>
        </div>
      </CardHeader>
      {companyNames != null && companyNames.length > 0 && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">
            {companyNames.join(", ")}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
