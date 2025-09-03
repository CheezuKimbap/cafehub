"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { checkout } from "@/redux/features/checkout/checkoutSlice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckoutConfirm } from "./CheckoutConfirm";
import { useSession } from "next-auth/react";

interface CheckoutFormProps {
  total: number;
  onCancel: () => void;
}

export function CheckoutForm({ total, onCancel }: CheckoutFormProps) {
  const [voucher, setVoucher] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { loading, error } = useAppSelector((state) => state.checkout);

  const handleCheckout = async () => {
    if (!customerId) return;
    try {
      await dispatch(
        checkout({
          customerId, // 🔹 replace with actual logged-in customerId
          // Instead of discountApplied, you can send voucher code to backend
          discountApplied: voucher ? 100 : 0,
        })
      ).unwrap();

      // Close modal on success
      onCancel();
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  };

  return (
    <form className="space-y-6">
      {/* Voucher input */}
      <div>
        <Label htmlFor="voucher">Discount Voucher</Label>
        <Input
          id="voucher"
          type="text"
          placeholder="Enter voucher code"
          value={voucher}
          onChange={(e) => setVoucher(e.target.value)}
        />
      </div>

      {/* Payment Method */}
      <div>
        <Label>Payment Method</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="GCASH">GCash</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Confirm / Cancel */}
      <CheckoutConfirm
        total={total}
        onCheckout={handleCheckout}
        onCancel={onCancel}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
}
