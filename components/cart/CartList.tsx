"use client";

import { CartItem as CartItemType } from "@/redux/features/cart/cart";
import { CartItem } from "@/components/cart/CartItem";

interface CartListProps {
  items: CartItemType[];
  onUpdateQuantity: (
    itemId: string,
    quantity: number,
    callAPI: boolean,
  ) => void;
  onRemove: (cartItemId: string) => void;
}

export function CartList({ items, onUpdateQuantity, onRemove }: CartListProps) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {items.map((item) => (
        <CartItem
          key={item.id}
          id={item.id}
          product={item.product}
          servingType={item.servingType}
          addons={item.addons}
          quantity={item.quantity}
          onUpdateQuantity={onUpdateQuantity} // now passes callAPI from CartItem
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
