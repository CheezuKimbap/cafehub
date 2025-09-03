// CheckoutDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckoutForm } from "./CheckoutForm";

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  total: number;
}

export function CheckoutDialog({ open, onClose, total }: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Confirm Checkout</DialogTitle>
        </DialogHeader>

        {/* Form with discount + payment method + confirm buttons */}
        <CheckoutForm total={total} onCancel={onClose} />
      </DialogContent>
    </Dialog>
  );
}
