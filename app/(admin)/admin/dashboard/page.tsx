"use client";

import { MostSoldItemsCard } from "@/components/admin/charts/MostSoldItemsCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { TodayRevenue } from "@/components/admin/charts/TodayRevenue";
import { TotalOrder } from "@/components/admin/charts/TotalOrders";
import { WeekSales } from "@/components/admin/charts/WeeklySales";
import { LatestOrdersCard } from "@/components/admin/tables/OrderTable";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { fetchOrders } from "@/redux/features/order/orderSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.order);
  const { data: session } = useSession();

  useEffect(() => {
    dispatch(fetchOrders());
    // pass user id if your thunk needs it
  }, [dispatch, session]);
  const totalRevenueData = [
    { month: "Jan", profit: 90000, loss: 60000 },
    { month: "Feb", profit: 75000, loss: 50000 },
    { month: "Mar", profit: 80000, loss: 30000 },
    { month: "Apr", profit: 65000, loss: 70000 },
    { month: "May", profit: 75000, loss: 55000 },
    { month: "Jun", profit: 50000, loss: 30000 },
    { month: "Jul", profit: 70000, loss: 40000 },
    { month: "Aug", profit: 80000, loss: 50000 },
    { month: "Sep", profit: 75000, loss: 55000 },
  ];

  const latestOrders = [
    {
      product: "Latte",
      orderId: "#11232",
      date: "May 29, 2025",
      customer: "Joe Bama",
      status: "Picked-up",
      amount: "P400.00",
    },
    // ...other orders
  ];
  const mostSoldItems = [
    { name: "Espresso", value: 80 },
    { name: "Latte", value: 65 },
    { name: "Cappuccino", value: 50 },
    { name: "Americano", value: 40 },
  ];

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-6 bg-gray-100 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <WeekSales />
          <TodayRevenue />
          <TotalOrder />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RevenueChart />
          </div>
          <div className="col-span-1">
            <MostSoldItemsCard items={mostSoldItems} />
          </div>
        </div>

        {/* <LatestOrdersCard orders={order}> */}
      </div>
    </div>
  );
}
