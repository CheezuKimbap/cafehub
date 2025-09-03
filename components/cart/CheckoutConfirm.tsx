"use client";

import { Button } from "@/components/ui/button";

interface CheckoutConfirmProps {
  total: number;
  onCheckout: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CheckoutConfirm({
  total,
  onCheckout,
  onCancel,
  loading = false,
}: CheckoutConfirmProps) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button
        onClick={onCheckout}
        className="bg-green-600 hover:bg-green-700 text-white"
        disabled={loading}
      >
        {loading ? "Processing..." : `Confirm ₱${total.toFixed(2)}`}
      </Button>
    </div>
  );
}
