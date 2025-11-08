"use client";

import { MostSoldItemsCard } from "@/components/admin/charts/MostSoldItemsCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { TodayRevenue } from "@/components/admin/charts/TodayRevenue";
import { TotalOrder } from "@/components/admin/charts/TotalOrders";
import { WeekSales } from "@/components/admin/charts/WeeklySales";
import { LatestOrdersCard } from "@/components/admin/customer/OrderTable";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { fetchOrders } from "@/redux/features/order/orderSlice";
import { fetchMostSold, selectMostSold } from "@/redux/features/reports/mostSoldSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { orders, status, error: orderError } = useAppSelector((state) => state.order);
  const { data: session } = useSession();

  const { items: mostSoldItems, loading: mostSoldLoading, error: mostSoldError } =
  useAppSelector((state) => state.mostSold);


  useEffect(() => {
    dispatch(fetchMostSold());
  }, [dispatch, session]);

  useEffect(() => {
    dispatch(fetchOrders());
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



  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-6 bg-gray-100 space-y-6">
        {/* <div className="grid grid-cols-3 gap-4"> */}
          {/* <WeekSales /> */}
        {/* <TodayRevenue data={[{ value: amount ?? 0 }]} />
          <TotalOrder />
        </div> */}

        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RevenueChart />
          </div>
          <div className="col-span-1">
            <MostSoldItemsCard items={mostSoldItems} />
          </div>
        </div>

        {status === "success" && orders.length > 0 ? (
          <LatestOrdersCard orders={orders} />
        ) : status === "loading" ? (
          <div>Loading...</div>
        ) : (
          <div>No orders yet</div>
        )}
      </div>
    </div>
  );
}
