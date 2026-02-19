import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createMessageSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/** GET /api/messages — Return messages for an application, or message threads for a hiring manager / candidate. */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get("applicationId");
  const hiringManagerId = searchParams.get("hiringManagerId");
  const candidateId = searchParams.get("candidateId");

  if (applicationId) {
    const messages = await prisma.message.findMany({
      where: { applicationId },
      orderBy: { createdAt: "asc" },
      include: {
        hiringManager: {
          select: { id: true, name: true, avatarUrl: true },
        },
        candidate: {
          select: { id: true, name: true, avatarUrl: true },
        },
      },
    });

    const items = messages.map((m) => {
      const sender = m.hiringManagerId
        ? {
            type: "hiring-manager" as const,
            id: m.hiringManager!.id,
            name: m.hiringManager!.name,
            avatarUrl: m.hiringManager!.avatarUrl,
          }
        : {
            type: "candidate" as const,
            id: m.candidate!.id,
            name: m.candidate!.name,
            avatarUrl: m.candidate!.avatarUrl,
          };
      return {
        id: m.id,
        content: m.content,
        createdAt: m.createdAt,
        sender,
      };
    });

    return NextResponse.json({ messages: items });
  }

  if (hiringManagerId) {
    const applications = await prisma.application.findMany({
      where: {
        role: { hiringManagerId },
        OR: [
          { status: "accepted" },
          { messages: { some: {} } },
        ],
      },
      include: {
        role: {
          include: { company: { select: { id: true, name: true } } },
        },
        candidate: { select: { id: true, name: true, avatarUrl: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });

    const threads = applications.map((app) => {
      const lastMsg = app.messages[0];
      return {
        applicationId: app.id,
        roleId: app.role.id,
        companyId: app.role.company.id,
        roleTitle: app.role.title,
        companyName: app.role.company.name,
        otherParty: {
          name: app.candidate.name,
          avatarUrl: app.candidate.avatarUrl,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              isFromMe: lastMsg.hiringManagerId === hiringManagerId,
            }
          : null,
        messageCount: app._count.messages,
      };
    });

    threads.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? new Date(0);
      const bTime = b.lastMessage?.createdAt ?? new Date(0);
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({ threads });
  }

  if (candidateId) {
    const applications = await prisma.application.findMany({
      where: {
        candidateId,
        status: { in: ["interview", "accepted"] },
      },
      include: {
        role: {
          include: {
            company: { select: { name: true } },
            hiringManager: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: { select: { messages: true } },
      },
    });

    const threads = applications.map((app) => {
      const lastMsg = app.messages[0];
      return {
        applicationId: app.id,
        roleTitle: app.role.title,
        companyName: app.role.company.name,
        otherParty: {
          name: app.role.hiringManager.name,
          avatarUrl: app.role.hiringManager.avatarUrl,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt,
              isFromMe: lastMsg.candidateId === candidateId,
            }
          : null,
        messageCount: app._count.messages,
      };
    });

    threads.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? new Date(0);
      const bTime = b.lastMessage?.createdAt ?? new Date(0);
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    return NextResponse.json({ threads });
  }

  return NextResponse.json(
    { error: "applicationId, hiringManagerId, or candidateId is required" },
    { status: 400 }
  );
}

/** POST /api/messages — Send a message on an application thread (interview or accepted stage only). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { applicationId, content, hiringManagerId, candidateId } = parsed.data;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { role: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    if (!["interview", "accepted"].includes(application.status)) {
      return NextResponse.json(
        { error: "Messaging is only available for applications in interview or accepted stage." },
        { status: 400 }
      );
    }

    const isHm = !!hiringManagerId;
    const senderId = isHm ? hiringManagerId : candidateId;
    if (!senderId) {
      return NextResponse.json(
        { error: "Invalid sender" },
        { status: 400 }
      );
    }

    const isRoleHm = application.role.hiringManagerId === senderId;
    const isApplicationCandidate = application.candidateId === senderId;
    if (isHm && !isRoleHm) {
      return NextResponse.json(
        { error: "You are not the hiring manager for this role" },
        { status: 403 }
      );
    }
    if (!isHm && !isApplicationCandidate) {
      return NextResponse.json(
        { error: "You are not the candidate for this application" },
        { status: 403 }
      );
    }

    const message = await prisma.message.create({
      data: {
        applicationId,
        content: content.trim(),
        hiringManagerId: hiringManagerId ?? undefined,
        candidateId: candidateId ?? undefined,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
