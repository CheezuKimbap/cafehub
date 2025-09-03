"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Product } from "@/redux/features/products/product";

export interface CartItemProps {
  id: string;
  product: Product; // ✅ required
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  product,
  quantity,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
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
        <p className="text-sm text-gray-600">${product.price.toFixed(2)}</p>
        <div className="flex items-center gap-2 mt-2">
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => onUpdateQuantity(id, parseInt(e.target.value))}
            className="w-16"
          />
          <Button variant="destructive" onClick={() => onRemove(id)}>
            Remove
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <p className="font-semibold">
          ${(product.price * quantity).toFixed(2)}
        </p>
      </CardFooter>
    </Card>
  );
}
