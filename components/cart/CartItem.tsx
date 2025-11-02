"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CartItemAddon } from "@/redux/features/cart/cart";

export interface CartItemProps {
  id: string;
  variant: {
    id: string;
    price: number;
    servingType: string;
    product: {
      id: string;
      name: string;
      image?: string | null;
    };
  };
  quantity: number;
  addons?: CartItemAddon[];
  onUpdateQuantity: (id: string, quantity: number, callAPI: boolean) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  variant,
  quantity,
  addons = [],
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const [localQty, setLocalQty] = useState(quantity);

  const increment = () => {
    const newQty = localQty + 1;
    setLocalQty(newQty);
    onUpdateQuantity(id, newQty, true);
  };

  const decrement = () => {
    if (localQty > 1) {
      const newQty = localQty - 1;
      setLocalQty(newQty);
      onUpdateQuantity(id, newQty, true);
    }
  };

  const baseTotal = variant.price * localQty;
  const addonsTotal = addons.reduce(
    (sum, a) => sum + a.addon.price * localQty,
    0
  );
  const finalTotal = baseTotal + addonsTotal;

  return (
    <Card className="w-full p-4 space-y-3">
      <CardContent className="p-0">
        <div className="flex gap-3">
          {variant.product?.image && (
            <img
            src={variant.product?.image ?? "/placeholder.png"}
            alt={variant.product?.name ?? "Product"}
            className="w-20 h-20 object-cover rounded-md border"
            />
          )}

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">{variant.product?.name}</h3>
              <p className="text-sm text-gray-600">
                Serving: <strong>{variant.servingType}</strong>
              </p>
              <p className="text-sm text-gray-600">
                Price: ₱ {variant.price.toFixed(2)}
              </p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center border rounded-md">
                <Button variant="outline" className="px-3" onClick={decrement}>
                  –
                </Button>

                <Input
                  type="number"
                  value={localQty}
                  onChange={(e) => {
                    const val = Math.max(1, Number(e.target.value));
                    setLocalQty(val);
                    onUpdateQuantity(id, val, false);
                  }}
                  onBlur={() => onUpdateQuantity(id, localQty, true)}
                  className="w-12 text-center border-0"
                />

                <Button variant="outline" className="px-3" onClick={increment}>
                  +
                </Button>
              </div>

              <Button variant="destructive" onClick={() => onRemove(id)}>
                Remove
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <p className="font-semibold text-lg whitespace-nowrap">
              ₱ {finalTotal.toFixed(2)}
            </p>
          </div>
        </div>
      </CardContent>

      {addons.length > 0 && (
        <div className="ml-24 space-y-1 border-t pt-2">
          <p className="text-sm font-semibold text-gray-700">Add-ons</p>

          {addons.map(({ addon, addonId, quantity }) => (
            <div
              key={addonId}
              className="flex justify-between text-sm border-b last:border-none pb-1"
            >
              <div>
                <span className="font-medium">{addon.name}</span>
                <span className="block text-xs text-gray-500">
                  ₱ {addon.price.toFixed(2)} × {quantity} per item
                </span>
              </div>

              <span className="font-semibold">
                ₱ {(addon.price * localQty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
