import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHiringManagerSchema, createCandidateSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/personas — Return all persona hiring managers and candidates for the landing page. */
export async function GET() {
  const [hiringManagers, candidates] = await Promise.all([
    prisma.hiringManager.findMany({
      where: { isPersona: true },
      include: {
        company: { select: { id: true, name: true } },
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

/** POST /api/personas — Create a new hiring manager (with company) or candidate. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === "hiring-manager") {
      const parsed = createHiringManagerSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const existing = await prisma.hiringManager.findUnique({
        where: { email: parsed.data.email },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A hiring manager with this email already exists" },
          { status: 409 }
        );
      }

      const company = await prisma.company.create({
        data: {
          name: parsed.data.companyName,
          description: parsed.data.companyDescription || null,
          industry: parsed.data.companyIndustry || null,
          location: parsed.data.companyLocation || null,
        },
      });

      const hm = await prisma.hiringManager.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          title: parsed.data.title || null,
          companyId: company.id,
          isPersona: true,
        },
        include: {
          company: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json(hm, { status: 201 });
    }

    if (type === "candidate") {
      const parsed = createCandidateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 }
        );
      }

      const existing = await prisma.candidate.findUnique({
        where: { email: parsed.data.email },
      });
      if (existing) {
        return NextResponse.json(
          { error: "A candidate with this email already exists" },
          { status: 409 }
        );
      }

      const candidate = await prisma.candidate.create({
        data: {
          name: parsed.data.name,
          email: parsed.data.email,
          headline: parsed.data.headline || null,
          isPersona: true,
        },
      });

      return NextResponse.json(candidate, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid type. Must be 'hiring-manager' or 'candidate'" },
      { status: 400 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create persona" },
      { status: 500 }
    );
  }
}
