import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createCompanyWithHmSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/companies — List all companies, or a hiring manager's companies with role/application counts. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const hiringManagerId = searchParams.get("hiringManagerId");

  if (hiringManagerId) {
    const hmCompanies = await prisma.hiringManagerCompany.findMany({
      where: { hiringManagerId },
      include: {
        company: {
          include: {
            roles: {
              where: {
                deletedAt: null,
                status: { in: ["draft", "published", "closed"] },
              },
              include: {
                _count: {
                  select: {
                    applications: { where: { status: "new" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const companies = hmCompanies.map(({ company }) => {
      const roleCount = company.roles.length;
      const newApplicationCount = company.roles.reduce(
        (sum, r) => sum + r._count.applications,
        0
      );
      return {
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        location: company.location,
        website: company.website,
        logoUrl: company.logoUrl,
        roleCount,
        newApplicationCount,
      };
    });

    return NextResponse.json({ companies });
  }

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ companies });
}

/** POST /api/companies — Create a new company and associate it with a hiring manager. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCompanyWithHmSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { hiringManagerId, ...data } = parsed.data;
    const website =
      data.website === "" || data.website == null ? null : data.website;

    const company = await prisma.company.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        industry: data.industry ?? null,
        location: data.location ?? null,
        website,
      },
    });

    await prisma.hiringManagerCompany.create({
      data: {
        hiringManagerId,
        companyId: company.id,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
