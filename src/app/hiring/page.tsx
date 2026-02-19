"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";

export default function HiringDashboardPage() {
  const router = useRouter();
  const { persona, isLoading } = usePersona();

  useEffect(() => {
    if (isLoading) return;
    if (persona?.type === "hiring-manager" && persona.companyId) {
      router.replace(`/hiring/company/${persona.companyId}/roles`);
    } else {
      router.replace("/");
    }
  }, [persona, isLoading, router]);

  return null;
}
