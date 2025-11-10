"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { checkout } from "@/redux/features/checkout/checkoutSlice";
import {
  fetchDiscounts,
  selectDiscounts,
} from "@/redux/features/discount/discountSlice";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { cart } = useAppSelector((state) => state.cart);
  const discounts = useAppSelector(selectDiscounts);
  const { loading, error } = useAppSelector((state) => state.checkout);

  useEffect(() => {
    if (customerId) {
      dispatch(fetchDiscounts(customerId));
    }
  }, [customerId, dispatch]);

  // ✅ compute subtotal from variant.price
  const subtotal =
    cart?.items.reduce((acc, item) => {
      const basePrice = item.variant?.price ?? 0;
      let itemTotal = basePrice * item.quantity;

      // ✅ addons pricing
      if (item.addons.length > 0) {
        item.addons.forEach((addon) => {
          itemTotal += (addon.addon?.price ?? 0) * addon.quantity;
        });
      }
      return acc + itemTotal;
    }, 0) || 0;

  // ✅ selected discount
  const discount = discounts.find((d) => d.id === selectedVoucher);

  // ✅ apply discount to the cheapest drink (variant.price)
  let discountAmount = 0;
  if (discount && cart?.items.length) {
    const sortedItems = [...cart.items].sort(
      (a, b) => (a.variant?.price ?? 0) - (b.variant?.price ?? 0),
    );
    const target = sortedItems[0];
    const price = target.variant?.price ?? 0;

    if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
      discountAmount = (price * discount.discountAmount) / 100;
    } else if (discount.type === "FIXED_AMOUNT" && discount.discountAmount) {
      discountAmount = Math.min(discount.discountAmount, price);
    } else if (discount.type === "FREE_ITEM") {
      discountAmount = price;
    }
  }

  const finalTotal = Math.max(subtotal - discountAmount, 0);

  const handleCheckout = async () => {
    if (!customerId) return;

    try {
      await dispatch(
        checkout({
          customerId,
          discountId: selectedVoucher ?? undefined,
        }),
      ).unwrap();

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
          <div key={item.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-gray-700">
              <div className="flex items-center gap-3">
                {/* ✅ Image is now from variant.product.image */}
                {item.variant?.product?.image && (
                  <img
                    src={item.variant.product.image}
                    alt={item.variant.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}

                <span>
                  {item.variant.product.name} ({item.variant.servingType}) ×{" "}
                  {item.quantity}
                </span>
              </div>

              {/* ✅ Price from variant.price */}
              <span className="font-medium">
                ₱{((item.variant?.price ?? 0) * item.quantity).toFixed(2)}
              </span>
            </div>

            {/* Addons */}
            {item.addons.length > 0 && (
              <div className="pl-12 text-sm text-gray-600 space-y-1">
                {item.addons.map((addon) => (
                  <div key={addon.addonId} className="flex justify-between">
                    <span>
                      + {addon.addon?.name} x {addon.quantity}
                    </span>
                    <span>
                      ₱{((addon.addon?.price ?? 0) * addon.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Summary */}
        <div className="border-t pt-2 mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₱{subtotal.toFixed(2)}</span>
          </div>

          {discount && (
            <div className="flex justify-between text-green-600">
              <span>Voucher ({discount.description})</span>
              <span>-₱{discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>₱{finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Voucher */}
      {discounts.length > 0 && (
        <div>
          <Label>Use a voucher</Label>
          <RadioGroup
            value={selectedVoucher ?? ""}
            onValueChange={(val) => setSelectedVoucher(val === "" ? null : val)}
            className="space-y-2"
          >
            {discounts.map((d) => (
              <div key={d.id} className="flex items-center gap-2">
                <RadioGroupItem value={d.id} />
                <span>{d.description}</span>
              </div>
            ))}
            <div className="flex items-center mt-1">
              <RadioGroupItem value="" />
              <span>No voucher</span>
            </div>
          </RadioGroup>
        </div>
      )}

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
          </SelectContent>
        </Select>
      </div>

      {/* Confirm Buttons */}
      <CheckoutConfirm
        total={finalTotal}
        onCheckout={handleCheckout}
        onCancel={onCancel}
        loading={loading}
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </>
  );
}
