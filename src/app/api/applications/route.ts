import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createApplicationSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/applications — List applications filtered by candidateId or roleId. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const candidateId = searchParams.get("candidateId");
  const roleId = searchParams.get("roleId");

  if (roleId) {
    const applications = await prisma.application.findMany({
      where: { roleId },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            headline: true,
            skills: true,
            yearsExperience: true,
            linkedinUrl: true,
            avatarUrl: true,
          },
        },
        role: {
          select: { id: true, title: true, companyId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      applications,
      pagination: { page: 1, limit: applications.length, total: applications.length, totalPages: 1 },
    });
  }

  if (!candidateId) {
    return NextResponse.json(
      { error: "candidateId or roleId is required" },
      { status: 400 }
    );
  }

  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  const [applications, total] = await Promise.all([
    prisma.application.findMany({
      where: { candidateId },
      include: {
        role: {
          include: {
            company: { select: { id: true, name: true, logoUrl: true } },
            hiringManager: {
              select: { id: true, name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.application.count({ where: { candidateId } }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const items = applications.map((a) => ({
    ...a,
    messagingAvailable: a.status === "accepted",
  }));

  return NextResponse.json({
    applications: items,
    pagination: { page, limit, total, totalPages },
  });
}

/** POST /api/applications — Create a new application for a candidate on a published role. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = createApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { roleId, candidateId, coverNote } = parsed.data;

  const [role, candidate, existing] = await Promise.all([
    prisma.role.findUnique({ where: { id: roleId } }),
    prisma.candidate.findUnique({ where: { id: candidateId } }),
    prisma.application.findUnique({
      where: { roleId_candidateId: { roleId, candidateId } },
    }),
  ]);

  if (!role) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (role.status !== "published" || role.deletedAt) {
    return NextResponse.json({ error: "Role is not open for applications" }, { status: 400 });
  }
  if (!candidate) {
    return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
  }
  if (existing) {
    return NextResponse.json(
      { error: "You have already applied to this role" },
      { status: 409 }
    );
  }

  const application = await prisma.application.create({
    data: { roleId, candidateId, coverNote: coverNote ?? undefined },
    include: {
      role: { include: { company: { select: { name: true } } } },
    },
  });

  return NextResponse.json(application, { status: 201 });
}
