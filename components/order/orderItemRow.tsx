"use client";

import { OrderItem } from "@/redux/features/order/order";

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps) {
  return (
    <tr>
      <td className="px-2 py-1">{item.variant.product.name}</td>
      <td className="px-2 py-1 text-center">{item.quantity}</td>
      <td className="px-2 py-1 text-center">{item.servingType}</td>
      <td className="px-2 py-1 text-right">P{item.priceAtPurchase}</td>
    </tr>
  );
}
