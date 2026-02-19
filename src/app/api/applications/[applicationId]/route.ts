import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateApplicationStatusSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** PATCH /api/applications/:applicationId — Update an application's status (e.g. accepted, rejected). */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ applicationId: string }> }
) {
  try {
    const { applicationId } = await params;
    const body = await request.json();
    const parsed = updateApplicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });
    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: parsed.data.status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}
