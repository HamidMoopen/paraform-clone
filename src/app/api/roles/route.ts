import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createRoleSchema } from "@/lib/validators";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId") ?? undefined;
  const includeAll = searchParams.get("includeAll") === "true";
  const hiringManagerId = searchParams.get("hiringManagerId") ?? undefined;

  const company = searchParams.get("company") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const salaryMinParam = searchParams.get("salaryMin");
  const salaryMaxParam = searchParams.get("salaryMax");
  const search = searchParams.get("search") ?? undefined;
  const candidateId = searchParams.get("candidateId") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10))
  );

  const salaryMin = salaryMinParam ? parseInt(salaryMinParam, 10) : undefined;
  const salaryMax = salaryMaxParam ? parseInt(salaryMaxParam, 10) : undefined;

  const where: Prisma.RoleWhereInput = {};

  if (companyId) where.companyId = companyId;
  if (hiringManagerId) where.hiringManagerId = hiringManagerId;

  if (!includeAll) {
    where.status = "published";
    where.deletedAt = null;
  }

  if (company) where.companyId = company;
  if (location)
    where.location = { contains: location, mode: "insensitive" };
  if (salaryMin != null && !Number.isNaN(salaryMin))
    where.salaryMax = { gte: salaryMin };
  if (salaryMax != null && !Number.isNaN(salaryMax))
    where.salaryMin = { lte: salaryMax };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (candidateId)
    where.NOT = { applications: { some: { candidateId } } };

  const include: Prisma.RoleInclude = {
    company: { select: { id: true, name: true, logoUrl: true } },
    _count: { select: { applications: true } },
  };

  if (includeAll) {
    (include as Prisma.RoleInclude).applications = {
      select: { status: true },
    };
  }

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      ...(includeAll ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.role.count({ where }),
  ]);

  const totalPages = includeAll ? 1 : Math.ceil(total / limit);

  return NextResponse.json({
    roles,
    pagination: {
      page: includeAll ? 1 : page,
      limit: includeAll ? total : limit,
      total,
      totalPages,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { status = "draft", ...data } = parsed.data;
    const role = await prisma.role.create({
      data: {
        ...data,
        status,
      },
    });
    return NextResponse.json(role, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
