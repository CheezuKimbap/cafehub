"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch } from "@/redux/hook";
import { updateOrderStatus } from "@/redux/features/order/orderSlice";
import { Order } from "@/redux/features/order/order";
import { OrderItemRow } from "../order/orderItemRow";

interface OrderCardProps {
  order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
  const dispatch = useAppDispatch();

  function handleMarkPaid() {
    dispatch(
      updateOrderStatus({
        id: order.id,
        status: "PAID",
        paymentStatus: "PAID",
      })
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Order #{order.id.slice(0, 8)}
          <Badge variant={order.status === "PENDING" ? "secondary" : "default"}>
            {order.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-64">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="text-left px-2 py-1">Product</th>
                <th className="text-center px-2 py-1">Qty</th>
                <th className="text-center px-2 py-1">Serving</th>
                <th className="text-right px-2 py-1">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.orderItems.map(function (item) {
                return <OrderItemRow key={item.id} item={item} />;
              })}
            </tbody>
          </table>
        </ScrollArea>
        <div className="mt-2 flex justify-between items-center">
          <span className="font-medium">Total: ${order.totalAmount}</span>
          <span>
            Payment:{" "}
            <Badge
              variant={
                order.paymentStatus === "PAID" ? "success" : "destructive"
              }
            >
              {order.paymentStatus}
            </Badge>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
