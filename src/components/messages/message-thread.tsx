"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

const MAX_CONTENT_LENGTH = 2000;

interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    type: "hiring-manager" | "candidate";
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface MessageThreadProps {
  applicationId: string;
  currentUserType: "hiring-manager" | "candidate";
  currentUserId: string;
}

export function MessageThread({
  applicationId,
  currentUserType,
  currentUserId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [failedId, setFailedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/messages?applicationId=${encodeURIComponent(applicationId)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to load messages");
      setMessages(data.messages ?? []);
    } catch (e) {
      toast.error("Failed to load messages");
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!loading && messages.length > 0) {
      scrollToBottom();
    }
  }, [loading, messages.length, scrollToBottom]);

  useEffect(() => {
    const interval = setInterval(fetchMessages, 30_000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const handleSend = async () => {
    const content = input.trim();
    if (!content || content.length > MAX_CONTENT_LENGTH || sending) return;

    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: MessageItem = {
      id: tempId,
      content,
      createdAt: now,
      sender: {
        type: currentUserType,
        id: currentUserId,
        name: "",
        avatarUrl: null,
      },
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setSending(true);
    setFailedId(null);

    const body: {
      applicationId: string;
      content: string;
      hiringManagerId?: string;
      candidateId?: string;
    } = {
      applicationId,
      content,
    };
    if (currentUserType === "hiring-manager") body.hiringManagerId = currentUserId;
    else body.candidateId = currentUserId;

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setFailedId(tempId);
        toast.error(data.error ?? "Failed to send");
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...m } : m))
        );
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                id: data.id,
                createdAt: data.createdAt,
              }
            : m
        )
      );
      scrollToBottom();
    } finally {
      setSending(false);
    }
  };

  const retryFailed = () => {
    const failed = messages.find((m) => m.id === failedId);
    if (failed) {
      setInput(failed.content);
      setMessages((prev) => prev.filter((m) => m.id !== failedId));
      setFailedId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-sm text-muted-foreground">Loading messages…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 min-h-[200px]"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet. Send one to start the conversation.
          </p>
        ) : (
          messages.map((msg) => {
            const isMe =
              msg.sender.type === currentUserType &&
              msg.sender.id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  isMe ? "flex-row-reverse" : "flex-row"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="text-xs bg-muted">
                    {msg.sender.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={msg.sender.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(msg.sender.name || "?")
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex flex-col max-w-[85%]",
                    isMe ? "items-end" : "items-start"
                  )}
                >
                  <span className="text-xs text-muted-foreground mb-0.5">
                    {msg.sender.name || (isMe ? "You" : "Other")}
                  </span>
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                      isMe
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {formatRelativeTime(new Date(msg.createdAt))}
                  </span>
                  {failedId === msg.id && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-destructive text-xs"
                      onClick={retryFailed}
                    >
                      Retry
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="border-t p-3 space-y-2">
        <Textarea
          placeholder="Type a message…"
          value={input}
          onChange={(e) =>
            setInput(e.target.value.slice(0, MAX_CONTENT_LENGTH))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          className="min-h-[60px] max-h-[120px] resize-none"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">
            {input.length} / {MAX_CONTENT_LENGTH}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMessages}
              className="text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={!input.trim() || sending}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
