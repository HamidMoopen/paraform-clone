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

export default function CandidateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { persona, clearPersona, isLoading } = usePersona();

  useEffect(() => {
    if (isLoading) return;
    if (!persona || persona.type !== "candidate") {
      router.replace("/");
    }
  }, [persona, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b bg-background">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-6">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
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

  if (!persona || persona.type !== "candidate") {
    return null;
  }

  const navLinks = [
    { href: "/candidate/roles", label: "Browse Roles" },
    { href: "/candidate/applications", label: "My Applications" },
    { href: "/candidate/messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b sticky top-0 z-10 bg-background">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
          <nav className="flex items-center gap-5">
            <Link
              href="/candidate/roles"
              className="font-semibold text-lg hover:opacity-80"
            >
              Jobaform
            </Link>
            {navLinks.map(({ href, label }) => {
              const isActive =
                href === "/candidate/roles"
                  ? pathname === "/candidate/roles" ||
                    pathname.startsWith("/candidate/roles/")
                  : href === "/candidate/messages"
                    ? pathname === "/candidate/messages" ||
                      pathname.startsWith("/candidate/messages")
                    : pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/candidate/profile"
              className="flex items-center gap-2 transition-opacity hover:opacity-80"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                  {getInitials(persona.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">
                {persona.name}
              </span>
            </Link>
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
