"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrdersByCustomerId } from "@/redux/features/order/orderSlice";
import { OrderCard } from "@/components/order/orderCard";
import { useSession } from "next-auth/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const STATUS_ORDER = [
  "PENDING",
  "PREPARING",
  "READYTOPICKUP",
  "COMPLETED",
] as const;

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.order);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.customerId) {
      dispatch(
        fetchOrdersByCustomerId({ customerId: session.user.customerId }),
      );
    }
  }, [dispatch, session, authStatus]);

  if (authStatus === "loading") return <p>Checking authentication...</p>;
  if (!session) return <p>Please sign in to see your orders.</p>;

  if (status === "loading") return <p>Loading orders...</p>;
  if (status === "failed") return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <Tabs defaultValue="PENDING" className="w-full">
        {/* Tab buttons */}
        <TabsList className="grid w-full grid-cols-4">
          {STATUS_ORDER.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s.replace("_", " ").toLowerCase()}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content */}
        {STATUS_ORDER.map((s) => (
          <TabsContent key={s} value={s} className="mt-4 space-y-4">
            {orders.filter((o) => o.status === s).length === 0 ? (
              <p className="text-sm text-gray-500">
                No {s.toLowerCase()} orders.
              </p>
            ) : (
              orders
                .filter((o) => o.status === s)
                .map((order) => <OrderCard key={order.orderNumber} order={order} />)
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
