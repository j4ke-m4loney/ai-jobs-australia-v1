"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CANCELLATION_REASONS = [
  "I found a job",
  "Too expensive for me",
  "The insights weren't useful enough",
  "I didn't use it enough to justify the cost",
  "Missing features I need",
  "Just trying it out",
  "Other",
] as const;

type CancellationReason = (typeof CANCELLATION_REASONS)[number];

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, feedback: string) => void;
  endDate: string;
  cancelling: boolean;
}

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirm,
  endDate,
  cancelling,
}: CancelSubscriptionModalProps) {
  const [selectedReason, setSelectedReason] =
    useState<CancellationReason | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleClose = () => {
    if (cancelling) return;
    setSelectedReason(null);
    setFeedback("");
    onClose();
  };

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason, feedback.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel AJA Intelligence?</DialogTitle>
          <DialogDescription>
            You&apos;ll keep access until {endDate}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Why are you cancelling?
            </Label>
            <div className="space-y-2">
              {CANCELLATION_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  disabled={cancelling}
                  className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                    selectedReason === reason
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cancel-feedback" className="text-sm font-medium">
              Anything else you&apos;d like to share?{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="cancel-feedback"
              placeholder="Your feedback helps us improve…"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={cancelling}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={cancelling}
          >
            Keep Subscription
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!selectedReason || cancelling}
          >
            {cancelling ? "Cancelling…" : "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
