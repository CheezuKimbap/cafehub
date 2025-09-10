"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch } from "@/redux/hook";
import { Order } from "@/redux/features/order/order";
import { OrderItemRow } from "../order/orderItemRow";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const dispatch = useAppDispatch();

  return (
    <Card className="mb-6 rounded-2xl border-2 border-[#d4c1a3] bg-[#fffdf8] shadow-md">
      {/* Header */}
      <CardHeader className="pb-2 border-b border-dashed border-[#cbb89d]">
        <CardTitle className="flex justify-between items-center text-lg font-bold text-[#5c3d2e]">
          Order #{order.id.slice(0, 6)}
          <Badge
            className="uppercase tracking-wide"
            variant={order.status === "PENDING" ? "secondary" : "default"}
          >
            {order.status}
          </Badge>
        </CardTitle>
        <p className="text-sm text-[#7a5c48]">
          {new Date(order.orderDate).toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="pt-4">
        <ScrollArea className="max-h-56 pr-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#7a5c48]">
                <th className="text-left px-2 py-1">Drink</th>
                <th className="text-center px-2 py-1">Qty</th>
                <th className="text-center px-2 py-1">Size</th>
                <th className="text-right px-2 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </tbody>
          </table>
        </ScrollArea>

        {/* Footer */}
        <div className="mt-4 border-t border-dashed border-[#cbb89d] pt-3 flex justify-between items-center text-base font-semibold text-[#5c3d2e]">
          <span>Total: P{order.totalAmount.toFixed(2)}</span>
          <Badge
            className="px-3 py-1"
            variant={order.paymentStatus === "PAID" ? "success" : "destructive"}
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
