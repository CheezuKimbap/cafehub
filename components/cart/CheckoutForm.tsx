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

  const { cart } = useAppSelector((state) => state.cart);

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
    <>
      {/* Cart Items Preview */}
      <div className="border rounded-lg p-4 space-y-2">
        <h3 className="font-semibold mb-2">Your Cart</h3>

        {cart?.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between text-sm text-gray-700"
          >
            {/* image + details */}
            <div className="flex items-center gap-3">
              <img
                src={item.product.image!}
                alt={item.product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <span>
                {item.product.name} ({item.servingType}) x {item.quantity}
              </span>
            </div>

            {/* line total */}
            <span className="font-medium">₱{item.price.toFixed(2)}</span>
          </div>
        ))}

        {/* total row */}
        <div className="flex justify-between font-semibold border-t pt-2 mt-2">
          <span>Total</span>
          <span>
            ₱{cart?.items.reduce((acc, item) => acc + item.price, 0).toFixed(2)}
          </span>
        </div>
      </div>

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
    </>
  );
}
