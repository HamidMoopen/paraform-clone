"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePersona } from "@/providers/persona-provider";
import type { CandidatePersona, HiringManagerPersona } from "@/providers/persona-provider";
import { PersonaCard } from "@/components/shared/persona-card";
import { Button } from "@/components/ui/button";

interface CompanyRelation {
  company: { id: string; name: string };
}

interface HiringManagerFromApi {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  title: string | null;
  companies: CompanyRelation[];
}

interface CandidateFromApi {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  headline: string | null;
}

interface PersonasResponse {
  hiringManagers: HiringManagerFromApi[];
  candidates: CandidateFromApi[];
}

export default function Home() {
  const router = useRouter();
  const { persona, setPersona, clearPersona, isLoading } = usePersona();
  const [data, setData] = useState<PersonasResponse | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/api/personas`
        : "/api/personas";
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load personas");
        return res.json();
      })
      .then(setData)
      .catch(() => setFetchError("Could not load personas"));
  }, []);

  const handleSelectCandidate = (c: CandidateFromApi) => {
    const p: CandidatePersona = {
      type: "candidate",
      id: c.id,
      name: c.name,
      email: c.email,
      avatarUrl: c.avatarUrl,
      headline: c.headline,
    };
    setPersona(p);
    router.push("/candidate/roles");
  };

  const handleSelectHiringManager = (hm: HiringManagerFromApi) => {
    const p: HiringManagerPersona = {
      type: "hiring-manager",
      id: hm.id,
      name: hm.name,
      email: hm.email,
      avatarUrl: hm.avatarUrl,
      title: hm.title,
      activeCompanyId: null,
      activeCompanyName: null,
    };
    setPersona(p);
    router.push("/hiring");
  };

  const handleContinue = () => {
    if (!persona) return;
    if (persona.type === "candidate") router.push("/candidate/roles");
    else router.push("/hiring");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 container max-w-4xl mx-auto px-4 py-12">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Jobaform</h1>
          <p className="text-muted-foreground mt-1">
            Demo — pick a persona to explore as a candidate or hiring manager.
          </p>
        </header>

        {persona && (
          <div className="flex justify-center mb-8">
            <Button variant="secondary" onClick={handleContinue}>
              Continue as {persona.name}
            </Button>
          </div>
        )}

        {fetchError && (
          <p className="text-center text-destructive mb-6">{fetchError}</p>
        )}

        {data && (
          <div className="grid md:grid-cols-2 gap-10">
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Enter as a Hiring Manager
              </h2>
              <div className="space-y-3">
                {data.hiringManagers.map((hm) => (
                  <PersonaCard
                    key={hm.id}
                    name={hm.name}
                    descriptor={hm.title ?? "Hiring Manager"}
                    companyNames={hm.companies.map((c) => c.company.name)}
                    onClick={() => handleSelectHiringManager(hm)}
                  />
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-lg font-semibold mb-4">
                Enter as a Candidate
              </h2>
              <div className="space-y-3">
                {data.candidates.map((c) => (
                  <PersonaCard
                    key={c.id}
                    name={c.name}
                    descriptor={c.headline ?? "Candidate"}
                    onClick={() => handleSelectCandidate(c)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <footer className="border-t py-6 mt-auto">
        <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built as a take-home project · 2025</p>
          <Link
            href="/"
            className="underline hover:text-foreground mt-1 inline-block"
            onClick={(e) => {
              e.preventDefault();
              clearPersona();
              router.refresh();
            }}
          >
            Switch persona
          </Link>
        </div>
      </footer>
    </main>
  );
}
