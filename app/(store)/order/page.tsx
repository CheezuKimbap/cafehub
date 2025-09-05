"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrders, selectOrders } from "@/redux/features/order/orderSlice";
import { OrderCard } from "@/components/order/orderCard";

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const { status, error } = useAppSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

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
