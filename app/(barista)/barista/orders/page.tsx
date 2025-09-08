"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchOrders,
  updateOrderStatus,
  selectOrders,
  selectOrderStatus,
} from "@/redux/features/order/orderSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/redux/features/order/order";

export default function BaristaBoard() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrderStatus);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleUpdateStatus = (
    id: string,
    next: OrderStatus,
    paymentStatus?: PaymentStatus
  ) => {
    dispatch(updateOrderStatus({ id, status: next, paymentStatus }));
  };

  const columns: { key: OrderStatus; title: string }[] = [
    { key: "PENDING", title: "Pending" },
    { key: "PREPARING", title: "Preparing" },
    { key: "READYTOPICKUP", title: "Ready for Pickup" },
    { key: "COMPLETED", title: "Completed" },
  ];

  const formatDateTime = (iso?: string) => {
    if (!iso) return null;
    const date = new Date(iso);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading")
    return <p className="p-4 text-gray-500">Loading orders...</p>;
  if (status === "failed")
    return <p className="p-4 text-red-500">Failed to load orders.</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.key} className="space-y-4">
          <h2 className="text-lg font-semibold">{col.title}</h2>

          {orders
            .filter((o) => o.status === col.key)
            .map((order) => (
              <Card key={order.id} className="shadow-md">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>#{order.id}</span>
                    <Badge>
                      {order.paymentStatus === "UNPAID"
                        ? "Unpaid"
                        : order.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-xs text-gray-500">
                    Created: {formatDateTime(order.orderDate)}
                  </p>
                </CardHeader>

                <CardContent>
                  <p className="font-medium text-sm">
                    {order.customer?.firstName ?? "Guest"}
                  </p>
                  <ul className="my-2 text-xs space-y-1">
                    {order.orderItems?.map((item) => (
                      <li key={item.id}>
                        {item.quantity}x{" "}
                        {item.product?.name ?? "Unknown Product"}
                      </li>
                    ))}
                  </ul>

                  {/* Payment Button (can be done anytime) */}
                  {order.paymentStatus === "UNPAID" && (
                    <Button
                      onClick={() =>
                        handleUpdateStatus(order.id, order.status, "PAID")
                      }
                      className="w-full mt-2"
                      variant="destructive"
                    >
                      Mark as Paid
                    </Button>
                  )}

                  {/* Workflow buttons (independent of payment) */}
                  {order.status === "PENDING" && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                      className="w-full mt-2"
                    >
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "PREPARING" && (
                    <Button
                      onClick={() =>
                        handleUpdateStatus(order.id, "READYTOPICKUP")
                      }
                      className="w-full mt-2"
                      variant="secondary"
                    >
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "READYTOPICKUP" && (
                    <Button
                      onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                      className="w-full mt-2"
                      variant="outline"
                    >
                      Mark Picked Up
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      ))}
    </div>
  );
}
