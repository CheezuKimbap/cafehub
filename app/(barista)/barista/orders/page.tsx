"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Utensils,
  Package,
  CheckCircle,
} from "lucide-react";
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
import type { Order, OrderStatus, PaymentStatus } from "@/redux/features/order/order";
import { toast } from "sonner";

export default function BaristaBoard() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrderStatus);

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  /* 🔁 INITIAL LOAD */
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  /* 🔔 SYNC WITH NOTIFICATIONS */
  useEffect(() => {
    async function handleNewOrder() {
      const res: any = await dispatch(fetchOrders());

      const newest = res.payload?.[0];
      if (newest) setActiveOrderId(newest.id);

      fetch("/api/barista/notifications/read", {
        method: "POST",
      }).catch(() => {});
    }

    window.addEventListener("new-order-notification", handleNewOrder);
    return () =>
      window.removeEventListener("new-order-notification", handleNewOrder);
  }, [dispatch]);

  const toastAndUpdate = (
    id: string,
    status: OrderStatus,
    message: string,
    paymentStatus?: PaymentStatus
  ) => {
    toast.info(message);
    dispatch(updateOrderStatus({ id, status, paymentStatus }));
    setActiveOrderId(null);
  };

  /* 🧮 PRICING (DISPLAY-ONLY) */
  const calculateSubtotal = (order: Order) =>
    order.discountApplied
      ? order.totalAmount + order.discountApplied
      : order.totalAmount;

  const calculateDiscount = (order: Order) =>
    order.discountApplied ?? 0;

  const isToday = (iso?: string) => {
    if (!iso) return false;
    const d = new Date(iso);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  };

  const formatDateTime = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  const columns: { key: OrderStatus; title: string }[] = [
    { key: "PENDING", title: "Pending" },
    { key: "PREPARING", title: "Preparing" },
    { key: "READYTOPICKUP", title: "Ready for Pickup" },
    { key: "COMPLETED", title: "Completed" },
  ];

  if (status === "loading")
    return <p className="p-4 text-gray-500">Loading orders...</p>;
  if (status === "failed")
    return <p className="p-4 text-red-500">Failed to load orders.</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(col => (
        <div key={col.key} className="space-y-4">
          {/* COLUMN HEADER */}
          <h2
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border shadow-sm font-semibold uppercase text-sm
              ${
                col.key === "PENDING"
                  ? "bg-orange-100 text-orange-800 border-orange-300"
                  : col.key === "PREPARING"
                  ? "bg-orange-200 text-orange-900 border-orange-400"
                  : col.key === "READYTOPICKUP"
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-gray-100 text-gray-800 border-gray-300"
              }`}
          >
            {col.key === "PENDING" && <Clock className="w-4 h-4" />}
            {col.key === "PREPARING" && <Utensils className="w-4 h-4" />}
            {col.key === "READYTOPICKUP" && <Package className="w-4 h-4" />}
            {col.key === "COMPLETED" && <CheckCircle className="w-4 h-4" />}
            {col.title}
          </h2>

          {/* MAIN ORDERS */}
          {orders
  .filter(o =>
    col.key === "COMPLETED"
      ? o.status === "COMPLETED" &&
        o.paymentStatus === "PAID" &&
        isToday(o.orderDate)
      : o.status === col.key
  )
  .sort(
    (a, b) =>
      new Date(a.orderDate ?? 0).getTime() -
      new Date(b.orderDate ?? 0).getTime()
  )

            .map(order => {
              const expanded = activeOrderId === order.id;
              const subtotal = calculateSubtotal(order);
              const discount = calculateDiscount(order);
              const total = order.totalAmount;

              return (
                <Card
                  key={order.id}
                  onClick={() =>
                    setActiveOrderId(prev =>
                      prev === order.id ? null : order.id
                    )
                  }
                  className="shadow-md cursor-pointer"
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>#{order.orderNumber}</span>
                      <Badge
                        className={
                          order.paymentStatus === "UNPAID"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {order.paymentStatus === "UNPAID"
                          ? "Unpaid"
                          : order.status}
                      </Badge>
                    </CardTitle>

                    <p className="text-xs text-gray-500">
                      Created: {formatDateTime(order.orderDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Scheduled Pickup:{" "}
                      {order.pickupTime
                        ? formatDateTime(order.pickupTime)
                        : "—"}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-2 space-y-2">
                    <p className="font-medium text-sm text-gray-800">
                      Customer:{" "}
                      {order.orderName ??
                        order.customer?.firstName ??
                        "—"}
                    </p>

                    <ul className="text-xs text-gray-600 space-y-1">
                      {order.orderItems.map(item => {
                        const itemTotal =
                          item.priceAtPurchase * item.quantity +
                          item.addons.reduce(
                            (sum, a) =>
                              sum + a.addon.price * a.quantity,
                            0
                          );

                        return (
                          <li key={item.id} className="flex justify-between">
                            <span>
                              {item.quantity}×{" "}
                              {item.variant?.product?.name ?? "Unknown"}
                            </span>
                            <span>₱{itemTotal}</span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* 💰 PRICE BREAKDOWN */}
                    <div className="pt-2 mt-2 border-t text-sm space-y-1">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>₱{subtotal}</span>
                      </div>

                      {discount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Discount</span>
                          <span>-₱{discount}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-semibold text-gray-800 pt-1">
                        <span>Total</span>
                        <span>₱{total}</span>
                      </div>
                    </div>

                    {/* ACTIONS */}
                    {expanded && (
                      <div
                        className="pt-3 space-y-2"
                        onClick={e => e.stopPropagation()}
                      >
                        {order.paymentStatus === "UNPAID" && (
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            onClick={() =>
                              toastAndUpdate(
                                order.id,
                                order.status,
                                "Marking as paid...",
                                "PAID"
                              )
                            }
                          >
                            Mark as Paid
                          </Button>
                        )}

                        {order.status === "PENDING" && (
                          <>
                            <Button
                              className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                              onClick={() =>
                                toastAndUpdate(
                                  order.id,
                                  "PREPARING",
                                  "Starting preparation..."
                                )
                              }
                            >
                              Start Preparing
                            </Button>
                            <Button
                              className="w-full bg-red-500 hover:bg-red-600 text-white"
                              onClick={() =>
                                toastAndUpdate(
                                  order.id,
                                  "CANCELLED",
                                  "Cancelling order..."
                                )
                              }
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}

                        {order.status === "PREPARING" && (
                          <>
                            <Button
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                              onClick={() =>
                                toastAndUpdate(
                                  order.id,
                                  "READYTOPICKUP",
                                  "Marking ready..."
                                )
                              }
                            >
                              Mark Ready
                            </Button>
                            <Button
                              className="w-full bg-red-500 hover:bg-red-600 text-white"
                              onClick={() =>
                                toastAndUpdate(
                                  order.id,
                                  "CANCELLED",
                                  "Cancelling order..."
                                )
                              }
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}

                        {order.status === "READYTOPICKUP" && (
                          <Button
                            className="w-full border border-gray-300"
                            disabled={order.paymentStatus === "UNPAID"}
                            onClick={() =>
                              toastAndUpdate(
                                order.id,
                                "COMPLETED",
                                "Completing order..."
                              )
                            }
                          >
                            Mark Picked Up
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

          {/* ♻️ CANCELLED ORDERS (TODAY) */}
          {col.key === "COMPLETED" && (
            <div className="pt-4 mt-4 border-t">
              <h3 className="text-xs font-semibold uppercase text-gray-600 mb-3">
                Cancelled Orders (Today)
              </h3>

              {orders
                .filter(o => o.status === "CANCELLED" && isToday(o.orderDate))
                .map(order => (
                  <Card
                    key={order.id}
                    className="bg-red-50 border-red-200 shadow-sm mb-2"
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex justify-between text-sm">
                        <span>#{order.orderNumber}</span>
                        <Badge className="bg-red-200 text-red-800">
                          Cancelled
                        </Badge>
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      <Button
                        size="sm"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() =>
                          toastAndUpdate(
                            order.id,
                            "PENDING",
                            "Reordering cancelled order...",
                            "UNPAID"
                          )
                        }
                      >
                        Reorder
                      </Button>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
