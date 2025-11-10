"use client";

import { useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import {
  selectCart,
  removeCartItem,
  updateItemQuantityLocally,
  updateCartItem,
} from "@/redux/features/cart/cartSlice";
import { Button } from "@/components/ui/button";

export function BaristaCart() {
  const dispatch = useAppDispatch();
  const cart = useAppSelector(selectCart);

  const total = useMemo(() => {
    if (!cart || !cart.items.length) return 0;
    return cart.items.reduce((acc, item) => {
      const productPrice = item.variant.product?.price ?? 0;
      const addonsTotal =
        item.addons?.reduce((sum, a) => sum + a.price * a.quantity, 0) ?? 0;
      return acc + productPrice * item.quantity + addonsTotal;
    }, 0);
  }, [cart]);

  const handleQuantityChange = (itemId: string, newQty: number) => {
    if (!cart) return;
    dispatch(updateItemQuantityLocally({ itemId, quantity: newQty }));
    dispatch(updateCartItem({ itemId, quantity: newQty })); // optional server sync
  };

  const handleRemove = (itemId: string) => {
    dispatch(removeCartItem(itemId));
  };

  if (!cart || cart.items.length === 0) {
    return <p className="text-gray-500 p-4">No orders yet</p>;
  }

  return (
    <div className="flex flex-col gap-4 p-4 border rounded bg-white">
      {cart.items.map((item, itemIndex) => (
        <div
          key={`cart-item-${item.id}-${itemIndex}`}
          className="border-b pb-2 flex flex-col gap-2"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                {item.variant.product?.name ?? "Unknown"}
              </p>
              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span>{item.quantity}</span>
              <Button
                size="sm"
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
              >
                +
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemove(item.id)}
              >
                Remove
              </Button>
            </div>
          </div>

          {/* Addons */}
          {item.addons && item.addons.length > 0 && (
            <div className="pl-4 flex flex-col gap-1">
              {item.addons.map((addon, addonIndex) => (
                <div
                  key={`addon-${item.id}-${addon.addonId}-${addonIndex}`}
                  className="flex justify-between text-sm"
                >
                  <span>{addon.addon?.name ?? "Addon"}</span>
                  <span>₱ {(addon.price * addon.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="mt-4 flex justify-between font-semibold text-lg">
        <span>Total:</span>
        <span>₱ {total.toFixed(2)}</span>
      </div>
    </div>
  );
}
