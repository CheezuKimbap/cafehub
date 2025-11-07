"use client";

import { useEffect, useState } from "react";
import { Clock, Utensils, Package, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
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

export default function BaristaBoard() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrderStatus);

  const [expandedOrders, setExpandedOrders] = useState<string[]>([]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const handleUpdateStatus = (id: string, next: OrderStatus, paymentStatus?: PaymentStatus) => {
    dispatch(updateOrderStatus({ id, status: next, paymentStatus }));
  };

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) =>
      prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
    );
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

  if (status === "loading") return <p className="p-4 text-gray-500">Loading orders...</p>;
  if (status === "failed") return <p className="p-4 text-red-500">Failed to load orders.</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map((col) => (
        <div key={col.key} className="space-y-4">
          <h2
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border shadow-sm font-semibold uppercase text-sm tracking-wide
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

          {orders
            .filter((o) => o.status === col.key)
            .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
            .map((order) => {
              const isExpanded = expandedOrders.includes(order.id);
              const showAllItems = col.key === "PENDING" || col.key === "PREPARING";

              const orderItems = showAllItems
                ? order.orderItems
                : isExpanded
                ? order.orderItems
                : order.orderItems.slice(0, 2);

              // Calculate totals
              const orderTotal = order.orderItems.reduce((sum, item) => {
                const base = item.priceAtPurchase * item.quantity;
                const addons = item.addons.reduce((aSum, a) => aSum + a.addon.price * a.quantity, 0);
                return sum + base + addons;
              }, 0);

              return (
                <Card key={order.id} className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>#{order.id}</span>
                      <Badge
                        className={
                          order.paymentStatus === "UNPAID"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }
                      >
                        {order.paymentStatus === "UNPAID" ? "Unpaid" : order.status}
                      </Badge>
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      Created: {formatDateTime(order.orderDate)}
                    </p>
                  </CardHeader>

                  <CardContent className="pt-3 space-y-2">
                    <p className="font-medium text-sm text-gray-800">
                      {order.customer?.firstName ?? "Guest"}
                    </p>

                    <ul className="text-xs text-gray-600 space-y-1">
                      {orderItems.map((item) => {
                        const itemTotal =
                          item.priceAtPurchase * item.quantity +
                          item.addons.reduce((sum, a) => sum + a.addon.price * a.quantity, 0);
                        return (
                          <li
                            key={item.id}
                            className={`flex flex-col p-1 rounded-md ${
                              item.addons.length > 0 ? "bg-yellow-50" : ""
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span>
                                {item.quantity}× {item.variant?.product?.name ?? "Unknown Product"}  (₱{item.priceAtPurchase.toFixed(2)}) - {item.variant?.servingType ?? ""}
                              </span>
                              <span>₱{itemTotal.toFixed(2)}</span>
                            </div>

                            {item.addons.length > 0 && (
                              <ul className="pl-4 text-xs text-gray-500 mt-1 space-y-0.5">
                                {item.addons.map((a) => (
                                  <li key={a.id}>
                                    {a.addon.name} × {a.quantity} (₱
                                    {(a.addon.price * a.quantity).toFixed(2)})
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        );
                      })}

                      {!showAllItems && order.orderItems.length > 2 && (
                        <li>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 mt-1"
                            onClick={() => toggleExpand(order.id)}
                          >
                            {isExpanded ? (
                              <>
                                Collapse <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                Show more ({order.orderItems.length - 2}){" "}
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </Button>
                        </li>
                      )}
                    </ul>

                    <p className="font-medium text-gray-700 mt-2">Total: ₱{orderTotal.toFixed(2)}</p>

                    {/* Actions */}
                    <div className="pt-2 space-y-2">
                      {order.paymentStatus === "UNPAID" && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, order.status, "PAID")}
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          Mark as Paid
                        </Button>
                      )}

                      {order.status === "PENDING" && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                          className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                        >
                          Start Preparing
                        </Button>
                      )}

                      {order.status === "PREPARING" && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, "READYTOPICKUP")}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          Mark Ready
                        </Button>
                      )}

                      {order.status === "READYTOPICKUP" && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                          className="w-full border border-gray-300 text-white hover:bg-gray-100"
                        >
                          Mark Picked Up
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      ))}
    </div>
  );
}
