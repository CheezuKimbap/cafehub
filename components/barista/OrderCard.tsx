"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type OrderStatus = "pending" | "preparing" | "ready" | "pickedup";

export type Order = {
  id: string;
  customer: string;
  items: { name: string; qty: number }[];
  status: OrderStatus;
  orderDate: string;
};

type OrderCardProps = {
  order: Order;
  onUpdateStatus: (id: string, next: OrderStatus) => void;
};

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>#{order.id}</span>
          <Badge>{order.status}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-medium text-sm">{order.customer}</p>
        <ul className="my-2 text-xs space-y-1">
          {order.items.map((item, idx) => (
            <li key={idx}>
              {item.qty}x {item.name}
            </li>
          ))}
        </ul>

        {order.status === "pending" && (
          <Button
            onClick={() => onUpdateStatus(order.id, "preparing")}
            className="w-full mt-2"
          >
            Start Preparing
          </Button>
        )}

        {order.status === "preparing" && (
          <Button
            onClick={() => onUpdateStatus(order.id, "ready")}
            className="w-full mt-2"
            variant="secondary"
          >
            Mark Ready
          </Button>
        )}

        {order.status === "ready" && (
          <Button
            onClick={() => onUpdateStatus(order.id, "pickedup")}
            className="w-full mt-2"
            variant="outline"
          >
            Mark Picked Up
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
