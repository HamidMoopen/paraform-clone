"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function HiringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { persona, clearPersona, isLoading } = usePersona();

  useEffect(() => {
    if (isLoading) return;
    if (!persona || persona.type !== "hiring-manager") {
      router.replace("/");
    }
  }, [persona, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col border-l-4 border-primary/30 bg-muted/20">
        <header className="border-b bg-background">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>
        </header>
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-28 rounded-xl border bg-card animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!persona || persona.type !== "hiring-manager") {
    return null;
  }

  const companyId = persona.companyId;
  const companyName = persona.companyName;

  return (
    <div className="min-h-screen flex flex-col border-l-4 border-primary/30 bg-muted/20">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
          <nav className="flex items-center gap-5">
            <Link
              href={`/hiring/company/${companyId}/roles`}
              className="font-semibold text-lg hover:opacity-80"
            >
              Jobaform
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <Link
              href={`/hiring/company/${companyId}/roles`}
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname.includes("/roles")
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {companyName}
            </Link>
            <Link
              href="/hiring/messages"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === "/hiring/messages"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Messages
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(persona.name)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex items-center gap-1 text-sm">
                <span className="font-medium">{persona.name}</span>
                {persona.title && (
                  <span className="text-muted-foreground">
                    · {persona.title}
                  </span>
                )}
              </div>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2 text-muted-foreground"
              onClick={() => {
                clearPersona();
                router.push("/");
              }}
            >
              Switch Persona
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
