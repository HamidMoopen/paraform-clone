"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const COVER_NOTE_MAX = 1000;

interface ApplyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleId: string;
  candidate: { id: string; name: string; email: string; linkedinUrl?: string | null };
  onSuccess: () => void;
}

export function ApplyDialog({
  open,
  onOpenChange,
  roleId,
  candidate,
  onSuccess,
}: ApplyDialogProps) {
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (coverNote.length > COVER_NOTE_MAX) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId,
          candidateId: candidate.id,
          coverNote: coverNote.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setError("You've already applied to this role.");
        return;
      }
      if (!res.ok) {
        setError(data.error ?? "Failed to submit application.");
        return;
      }
      toast.success("Application submitted!");
      onOpenChange(false);
      setCoverNote("");
      setError(null);
      onSuccess();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply for this role</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={candidate.name} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={candidate.email} readOnly className="bg-muted" />
          </div>
          {candidate.linkedinUrl && (
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={candidate.linkedinUrl}
                readOnly
                className="bg-muted"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="cover-note">Cover note (optional)</Label>
            <Textarea
              id="cover-note"
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value.slice(0, COVER_NOTE_MAX))}
              placeholder="Why are you a good fit?"
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {coverNote.length} / {COVER_NOTE_MAX}
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit application"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
