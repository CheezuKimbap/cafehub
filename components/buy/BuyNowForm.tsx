"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { buyProduct } from "@/redux/features/buyout/buyoutSlice";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
export function BuyNowForm({ product, quantity, selectedAddons, variantId, onCancel, customerId }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.buyout);
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const total =
    (product.price + selectedAddons.reduce((acc: any, a: any) => acc + a.price, 0)) *
    quantity;

  const handleBuyNow = async () => {
    if (!customerId) return alert("Please log in to buy.");

    try {
      await dispatch(
        buyProduct({
          customerId,        // ✅ include customerId
          variantId,
          quantity,
          addons: selectedAddons.map((a: any) => ({ addonId: a.id, quantity: a.quantity })),
          paymentType: paymentMethod,
          paymentProvider: paymentMethod,
        })
      ).unwrap();
      onCancel();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-semibold">{product.name}</p>
      <p>Total: ₱{total.toFixed(2)}</p>

      <div>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="GCASH">GCash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleBuyNow}
          className="bg-green-600 text-white"
          disabled={loading}
        >
          {loading ? "Processing..." : `Confirm ₱${total.toFixed(2)}`}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
