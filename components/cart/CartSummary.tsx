"use client";

import { Button } from "@/components/ui/button";

interface CartSummaryProps {
  total: number;
  onCheckout: () => void;
}

export function CartSummary({ total, onCheckout }: CartSummaryProps) {
  return (
    <div className="bg-white shadow-md p-6 rounded-lg w-full md:w-96">
      <h2 className="text-xl font-bold mb-4">Summary</h2>
      <div className="flex justify-between mb-4">
        <span>Total:</span>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </div>
      <Button onClick={onCheckout} className="w-full">
        Checkout
      </Button>
    </div>
  );
}
