import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateRoleStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/roles/:roleId — Return the detail for a single role, including its company. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;
  const { searchParams } = new URL(request.url);
  const forHm = searchParams.get("forHm") === "true";

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      company: true,
      _count: { select: { applications: true } },
      ...(forHm
        ? { applications: { select: { status: true } } }
        : {}),
    },
  });

  if (!role) {
    return NextResponse.json(
      { error: "Role not found" },
      { status: 404 }
    );
  }

  if (!forHm && (role.deletedAt != null || role.status !== "published")) {
    return NextResponse.json(
      { error: "Role not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(role);
}

/** PATCH /api/roles/:roleId — Update a role's status (e.g. draft, published, closed). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const body = await request.json();
    const parsed = updateRoleStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { status } = parsed.data;
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }
    const deletedAt =
      status === "closed" ? new Date() : status === "published" ? null : role.deletedAt;
    const updated = await prisma.role.update({
      where: { id: roleId },
      data: { status, deletedAt },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
