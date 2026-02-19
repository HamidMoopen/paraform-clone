"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MessageThread } from "@/components/messages/message-thread";

export interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  roleTitle: string;
  companyName: string;
  otherPartyName: string;
  candidateId: string;
}

export function MessageDialog({
  open,
  onOpenChange,
  applicationId,
  roleTitle,
  companyName,
  otherPartyName,
  candidateId,
}: MessageDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b shrink-0">
          <DialogTitle className="text-base font-medium">
            {roleTitle} · {companyName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Message with {otherPartyName}
          </p>
        </DialogHeader>
        <div className="flex-1 min-h-[300px] overflow-hidden flex flex-col">
          <MessageThread
            applicationId={applicationId}
            currentUserType="candidate"
            currentUserId={candidateId}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
