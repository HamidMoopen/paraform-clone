import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateCandidateProfileSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!candidate) {
    return NextResponse.json(
      { error: "Candidate not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(candidate);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  const { candidateId } = await params;

  const existing = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Candidate not found" },
      { status: 404 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const parsed = updateCandidateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const update: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    linkedinUrl: data.linkedinUrl === "" ? null : data.linkedinUrl ?? undefined,
    headline: data.headline ?? undefined,
    yearsExperience: data.yearsExperience ?? undefined,
    skills: data.skills ?? undefined,
    bio: data.bio ?? undefined,
  };

  const candidate = await prisma.candidate.update({
    where: { id: candidateId },
    data: update as Parameters<typeof prisma.candidate.update>[0]["data"],
  });

  return NextResponse.json(candidate);
}
