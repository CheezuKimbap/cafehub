"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/redux/features/products/product";

export interface CartItemProps {
  id: string;
  product: Product;
  quantity: number;
  servingType: string;
  onUpdateQuantity: (id: string, quantity: number, callAPI: boolean) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  product,
  quantity,
  servingType,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const [localQty, setLocalQty] = useState(quantity);

  const increment = () => {
    const newQty = localQty + 1;
    setLocalQty(newQty);
    onUpdateQuantity(id, newQty, true); // call API immediately
  };

  const decrement = () => {
    if (localQty > 1) {
      const newQty = localQty - 1;
      setLocalQty(newQty);
      onUpdateQuantity(id, newQty, true); // call API immediately
    }
  };

  return (
    <Card className="w-full flex flex-row items-center gap-4 p-4">
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="w-24 h-24 object-cover rounded-md"
        />
      )}

      <CardContent className="flex-1">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-gray-600">P {product.price.toFixed(2)}</p>
        <p className="text-sm text-gray-600 my-2">{servingType}</p>

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
                onUpdateQuantity(id, val, false); // only update UI
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

      <CardFooter>
        <p className="font-semibold">
          P {(product.price * localQty).toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}
