"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { MessageThread } from "@/components/messages/message-thread";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { APPLICATION_STATUS_LABELS, APPLICATION_STATUS_COLORS } from "@/lib/constants";

interface ThreadItem {
  applicationId: string;
  roleId?: string;
  companyId?: string;
  roleTitle: string;
  companyName: string;
  otherParty: { name: string; avatarUrl: string | null };
  lastMessage: {
    content: string;
    createdAt: string;
    isFromMe: boolean;
  } | null;
  messageCount: number;
}

export default function HiringMessagesPage() {
  const searchParams = useSearchParams();
  const { persona } = usePersona();
  const threadParam = searchParams.get("thread");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(() => {
    if (persona?.type !== "hiring-manager") return;
    setLoading(true);
    fetch(`/api/messages?hiringManagerId=${persona.id}`)
      .then((res) => res.json())
      .then((data) => setThreads(data.threads ?? []))
      .catch(() => setThreads([]))
      .finally(() => setLoading(false));
  }, [persona?.id, persona?.type]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  if (persona?.type !== "hiring-manager") return null;

  const selectedThread = threadParam
    ? threads.find((t) => t.applicationId === threadParam)
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Messages</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Conversations with accepted candidates.
      </p>

      <div className="flex flex-1 min-h-0 border rounded-xl bg-card overflow-hidden">
        <div
          className={cn(
            "flex flex-col w-full sm:w-80 shrink-0 border-r",
            selectedThread && "hidden sm:flex"
          )}
        >
          {loading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : threads.length === 0 ? (
            <Card className="m-4">
              <CardContent className="p-6 text-center text-sm text-muted-foreground">
                No messages yet. Accept an application to start a conversation.
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-y-auto flex-1">
              {threads.map((thread) => {
                const isActive = threadParam === thread.applicationId;
                return (
                  <Link
                    key={thread.applicationId}
                    href={`/hiring/messages?thread=${thread.applicationId}`}
                  >
                    <div
                      className={cn(
                        "p-4 border-b hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted"
                      )}
                    >
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {thread.otherParty.avatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thread.otherParty.avatarUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(thread.otherParty.name)
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">
                            {thread.otherParty.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {thread.roleTitle} · {thread.companyName}
                          </p>
                          {thread.lastMessage && (
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                              {thread.lastMessage.content.slice(0, 50)}
                              {thread.lastMessage.content.length > 50
                                ? "…"
                                : ""}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {thread.lastMessage
                                ? formatRelativeTime(
                                    new Date(thread.lastMessage.createdAt)
                                  )
                                : "No messages"}
                            </span>
                            {thread.messageCount > 0 && (
                              <span className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                {thread.messageCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {selectedThread ? (
            <>
              <div className="border-b p-3 flex flex-wrap items-center gap-2">
                <Link
                  href="/hiring/messages"
                  className="sm:hidden text-sm text-muted-foreground hover:text-foreground mr-2"
                >
                  ← Back
                </Link>
                <div>
                  <p className="font-medium">{selectedThread.otherParty.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedThread.roleTitle} · {selectedThread.companyName}
                  </p>
                </div>
                <Badge
                  className={cn(
                    "text-xs",
                    APPLICATION_STATUS_COLORS.accepted ?? "bg-muted"
                  )}
                >
                  {APPLICATION_STATUS_LABELS.accepted}
                </Badge>
                {selectedThread.companyId && selectedThread.roleId && (
                  <Link
                    href={`/hiring/company/${selectedThread.companyId}/roles/${selectedThread.roleId}/applications`}
                    className="text-xs text-primary hover:underline ml-auto"
                  >
                    View application
                  </Link>
                )}
              </div>
              <div className="flex-1 min-h-0">
                <MessageThread
                  applicationId={selectedThread.applicationId}
                  currentUserType="hiring-manager"
                  currentUserId={persona.id}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-muted-foreground text-sm">
              {threads.length > 0
                ? "Select a conversation"
                : "No conversations yet"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
