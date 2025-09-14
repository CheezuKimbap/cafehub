"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // 👈 import checkbox from shadcn/ui
import { Product } from "@/redux/features/products/product";
import { CartItemAddon } from "@/redux/features/cart/cart";

export interface CartItemProps {
  id: string;
  product: Product;
  quantity: number;
  servingType: string;
  addons?: CartItemAddon[];
  onUpdateQuantity: (id: string, quantity: number, callAPI: boolean) => void;
  onRemove: (id: string) => void;

  // addon handlers
  onToggleAddon?: (itemId: string, addonId: string, checked: boolean) => void;
}

export function CartItem({
  id,
  product,
  quantity,
  servingType,
  addons = [],
  onUpdateQuantity,
  onRemove,
  onToggleAddon,
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

  return (
    <Card className="w-full flex flex-col gap-4 p-4">
      <div className="flex flex-row gap-4">
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-md"
          />
        )}

        <CardContent className="flex-1 p-0">
          <h3 className="text-lg font-semibold">{product.name}</h3>
          <p className="text-sm text-gray-600">₱ {product.price.toFixed(2)}</p>
          <p className="text-sm text-gray-600 my-2">{servingType}</p>

          {/* Quantity controls */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <Button
                type="button"
                variant="outline"
                className="px-2"
                onClick={decrement}
              >
                –
              </Button>
              <Input
                type="text"
                value={localQty}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1;
                  setLocalQty(val);
                  onUpdateQuantity(id, val, false); // local only
                }}
                onBlur={() => onUpdateQuantity(id, localQty, true)}
                className="w-12 text-center border-0 focus:ring-0 focus:outline-none"
              />
              <Button
                type="button"
                variant="outline"
                className="px-2"
                onClick={increment}
              >
                +
              </Button>
            </div>

            <Button variant="destructive" onClick={() => onRemove(id)}>
              Remove
            </Button>
          </div>
        </CardContent>

        <CardFooter className="p-0">
          <p className="font-semibold">
            ₱ {(product.price * localQty).toFixed(2)}
          </p>
        </CardFooter>
      </div>

      {/* ---------- Addons as checkboxes ---------- */}
      {addons.length > 0 && (
        <div className="pl-28 flex flex-col gap-2">
          {addons.map((addon) => (
            <div
              key={addon.addonId}
              className="flex justify-between items-center border rounded-md p-2 bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={addon.quantity > 0}
                  onCheckedChange={(checked) =>
                    onToggleAddon?.(id, addon.addonId, !!checked)
                  }
                />
                <div>
                  <p className="text-sm font-medium">{addon.addon?.name}</p>
                  <p className="text-xs text-gray-600">
                    ₱ {addon.addon?.price.toFixed(2)}
                  </p>
                </div>
              </div>

              {addon.quantity > 0 && (
                <p className="text-sm font-semibold">
                  ₱ {(addon.addon?.price! * localQty).toFixed(2)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
