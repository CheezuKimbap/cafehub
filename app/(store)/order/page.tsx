"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrdersbyCustomerId } from "@/redux/features/order/orderSlice";
import { OrderCard } from "@/components/order/orderCard";
import { useSession } from "next-auth/react";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.order);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.id) {
      dispatch(
        fetchOrdersbyCustomerId({ customerId: session.user.customerId! })
      );
      // pass user id if your thunk needs it
    }
  }, [dispatch, session, authStatus]);

  if (authStatus === "loading") return <p>Checking authentication...</p>;
  if (!session) return <p>Please sign in to see your orders.</p>;

  if (status === "loading") return <p>Loading orders...</p>;
  if (status === "failed") return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      {orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} />)
      )}
    </div>
  );
}
