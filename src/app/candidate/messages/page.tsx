"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { usePersona } from "@/providers/persona-provider";
import { MessageThread } from "@/components/messages/message-thread";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { ThreadSkeleton } from "@/components/shared/page-skeleton";
import { getInitials } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MessageSquare } from "lucide-react";

interface ThreadItem {
  applicationId: string;
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

export default function CandidateMessagesPage() {
  useEffect(() => { document.title = "Messages | Job Board"; }, []);
  const searchParams = useSearchParams();
  const { persona } = usePersona();
  const threadParam = searchParams.get("thread");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchThreads = useCallback(() => {
    if (persona?.type !== "candidate") return;
    setLoading(true);
    setError(false);
    fetch(`/api/messages?candidateId=${persona.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setThreads(data.threads ?? []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [persona?.id, persona?.type]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  if (persona?.type !== "candidate") return null;

  const selectedThread = threadParam
    ? threads.find((t) => t.applicationId === threadParam)
    : null;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[400px]">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Messages</h1>
      <p className="text-muted-foreground text-sm mb-4">
        Conversations with hiring managers for your applications in interview or
        accepted stage.
      </p>

      <div className="flex flex-1 min-h-0 border rounded-xl bg-card overflow-hidden">
        <div
          className={cn(
            "flex flex-col w-full sm:w-80 shrink-0 border-r",
            selectedThread && "hidden sm:flex"
          )}
        >
          {error ? (
            <div className="p-4">
              <ErrorState message="Failed to load messages." onRetry={fetchThreads} />
            </div>
          ) : loading ? (
            <ThreadSkeleton />
          ) : threads.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={MessageSquare}
                title="No messages yet"
                description="When an application moves to interview or accepted, you can message the hiring manager here."
              />
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {threads.map((thread) => {
                const isActive = threadParam === thread.applicationId;
                return (
                  <Link
                    key={thread.applicationId}
                    href={`/candidate/messages?thread=${thread.applicationId}`}
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
                  href="/candidate/messages"
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
              </div>
              <div className="flex-1 min-h-0">
                <MessageThread
                  applicationId={selectedThread.applicationId}
                  currentUserType="candidate"
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
