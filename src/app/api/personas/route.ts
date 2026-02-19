import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const [hiringManagers, candidates] = await Promise.all([
    prisma.hiringManager.findMany({
      where: { isPersona: true },
      include: {
        companies: {
          include: { company: true },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.candidate.findMany({
      where: { isPersona: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ hiringManagers, candidates });
}
