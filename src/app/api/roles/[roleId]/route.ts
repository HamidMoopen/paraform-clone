import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await params;

  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      company: true,
      _count: { select: { applications: true } },
    },
  });

  if (
    !role ||
    role.deletedAt != null ||
    role.status !== "published"
  ) {
    return NextResponse.json(
      { error: "Role not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(role);
}
