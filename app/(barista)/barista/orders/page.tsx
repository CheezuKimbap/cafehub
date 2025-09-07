"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrders } from "@/redux/features/order/orderSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function timeAgo(dateString: string) {
  const now = new Date();
  const placed = new Date(dateString);
  const diffMs = now.getTime() - placed.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins === 1) return "1 minute ago";
  return `${mins} minutes ago`;
}

export default function BaristaOrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
    const interval = setInterval(() => {
      dispatch(fetchOrders());
    }, 60000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const pendingOrders = orders.filter((o: any) => o.status === "PENDING");
  const fulfilledOrders = orders
    .filter((o: any) => o.status === "FULFILLED")
    .slice(0, 5);

  const preparingCount = pendingOrders.filter(
    (o: any) => o.stage === "PREPARING"
  ).length;
  const readyCount = pendingOrders.filter(
    (o: any) => o.stage === "READY"
  ).length;
  const totalActive = pendingOrders.length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Order list</h1>

      {status === "loading" && <p>Loading orders...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <Card className="shadow-md border-blue-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Total Active</p>
                <p className="text-xl font-bold">{totalActive}</p>
              </CardContent>
            </Card>
            <Card className="shadow-md border-yellow-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Preparing</p>
                <p className="text-xl font-bold">{preparingCount}</p>
              </CardContent>
            </Card>
            <Card className="shadow-md border-green-500">
              <CardContent className="p-4 text-center">
                <p className="text-sm text-gray-500">Ready</p>
                <p className="text-xl font-bold">{readyCount}</p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-medium mb-4">Pending Orders</h2>
          {pendingOrders.length === 0 ? (
            <p className="text-gray-500">No pending orders 🎉</p>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order: any) => (
                <Card key={order.id} className="shadow-md border-yellow-500">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Order #{order.id.slice(0, 6)}</CardTitle>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600"
                    >
                      Fulfill
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Customer: {order.customer.firstName}{" "}
                      {order.customer.lastName ?? ""}
                    </p>
                    <div className="mt-3 space-y-2">
                      {order.orderItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2 rounded bg-gray-100 flex justify-between"
                        >
                          <span>
                            {item.quantity} × {item.product.name} (
                            {item.servingType})
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Placed {timeAgo(order.orderDate)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-medium mb-4">Recently Fulfilled</h2>
          {fulfilledOrders.length === 0 ? (
            <p className="text-gray-500">No fulfilled orders yet</p>
          ) : (
            <div className="space-y-4">
              {fulfilledOrders.map((order: any) => (
                <Card key={order.id} className="shadow-md border-green-500">
                  <CardHeader>
                    <CardTitle>Order #{order.id.slice(0, 6)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Customer: {order.customer.firstName}{" "}
                      {order.customer.lastName ?? ""}
                    </p>
                    <div className="mt-3 space-y-2">
                      {order.orderItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2 rounded bg-gray-50 flex justify-between"
                        >
                          <span>
                            {item.quantity} × {item.product.name} (
                            {item.servingType})
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Fulfilled {timeAgo(order.updatedAt ?? order.orderDate)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
