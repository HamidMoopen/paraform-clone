import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const salaryMinParam = searchParams.get("salaryMin");
  const salaryMaxParam = searchParams.get("salaryMax");
  const search = searchParams.get("search") ?? undefined;
  const candidateId = searchParams.get("candidateId") ?? undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  const salaryMin = salaryMinParam ? parseInt(salaryMinParam, 10) : undefined;
  const salaryMax = salaryMaxParam ? parseInt(salaryMaxParam, 10) : undefined;

  const where: Prisma.RoleWhereInput = {
    status: "published",
    deletedAt: null,
  };

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

  const [roles, total] = await Promise.all([
    prisma.role.findMany({
      where,
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.role.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return NextResponse.json({
    roles,
    pagination: { page, limit, total, totalPages },
  });
}
