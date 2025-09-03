"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckoutDialog } from "./CheckoutDialog";

interface CartSummaryProps {
  total: number;
  onCheckout: () => void;
}

export function CartSummary({ total, onCheckout }: CartSummaryProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white shadow-md p-6 rounded-lg w-full md:w-96">
      <h2 className="text-xl font-bold mb-4">Summary</h2>

      <div className="flex justify-between mb-4">
        <span>Total:</span>
        <span className="font-semibold">₱ {total.toFixed(2)}</span>
      </div>

      {/* Checkout button opens dialog */}
      <Button className="w-full" onClick={() => setOpen(true)}>
        Checkout
      </Button>

      {/* Checkout dialog */}
      <CheckoutDialog
        open={open}
        onClose={() => setOpen(false)}
        total={total}
      />
    </div>
  );
}
