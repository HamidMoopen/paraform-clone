"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function HiringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { persona, clearPersona, clearActiveCompany, isLoading } = usePersona();
  const [companyName, setCompanyName] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!persona || persona.type !== "hiring-manager") {
      router.replace("/");
    }
  }, [persona, isLoading, router]);

  const activeCompanyId =
    persona?.type === "hiring-manager" ? persona.activeCompanyId : null;

  useEffect(() => {
    if (!activeCompanyId) {
      setCompanyName(null);
      return;
    }
    fetch(`/api/companies?hiringManagerId=${persona!.id}`)
      .then((res) => res.json())
      .then((data) => {
        const company = (data.companies ?? []).find(
          (c: { id: string }) => c.id === activeCompanyId
        );
        setCompanyName(company?.name ?? null);
      })
      .catch(() => setCompanyName(null));
  }, [activeCompanyId, persona?.id, persona]);

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

  return (
    <div className="min-h-screen flex flex-col border-l-4 border-primary/30 bg-muted/20">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
          <nav className="flex items-center gap-6">
            <Link
              href="/hiring"
              className="font-semibold text-lg hover:opacity-80"
            >
              Job Board
            </Link>
            {activeCompanyId && (
              <>
                {companyName && (
                  <span className="text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                    {companyName}
                  </span>
                )}
                <Link
                  href={`/hiring/company/${activeCompanyId}/roles`}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname.includes("/roles") && !pathname.includes("/applications")
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground"
                  )}
                >
                  Roles
                </Link>
                <Link
                  href={`/hiring/company/${activeCompanyId}/roles/new`}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname.endsWith("/roles/new")
                      ? "text-foreground underline underline-offset-4"
                      : "text-muted-foreground"
                  )}
                >
                  Create Role
                </Link>
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {getInitials(persona.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">
              {persona.name}
              {persona.title && (
                <span className="text-muted-foreground font-normal">
                  {" "}
                  · {persona.title}
                </span>
              )}
            </span>
            {activeCompanyId && (
              <Link
                href="/hiring"
                onClick={(e) => {
                  e.preventDefault();
                  clearActiveCompany();
                  router.push("/hiring");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Switch Company
              </Link>
            )}
            <Link
              href="/"
              onClick={(e) => {
                e.preventDefault();
                clearPersona();
                router.push("/");
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Switch Persona
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>
    </div>
  );
}
