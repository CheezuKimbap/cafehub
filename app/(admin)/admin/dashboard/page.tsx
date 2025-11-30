"use client";

import { MostSoldItemsCard } from "@/components/admin/charts/MostSoldItemsCard";
import { RevenueChart } from "@/components/admin/charts/RevenueChart";
import { TodayRevenue } from "@/components/admin/charts/TodayRevenue";
import { TotalOrder } from "@/components/admin/charts/TotalOrders";
import { WeekSales } from "@/components/admin/charts/WeeklySales";
import { LatestOrdersCard } from "@/components/admin/customer/OrderTable";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { fetchOrders } from "@/redux/features/order/orderSlice";
import { fetchMostSold } from "@/redux/features/reports/mostSoldSlice";
import {
  fetchRevenue,
  selectRevenue,
} from "@/redux/features/reports/revenueSlice";
import {
  fetchWeeklySales,
  selectWeeklySales,
} from "@/redux/features/reports/weeklySaleSlice";
import { fetchTotalOrders } from "@/redux/features/reports/totalOrderSlice";
import {
  fetchMonthlyRevenue,
  selectMonthlyRevenue,
} from "@/redux/features/reports/monthlyRevenueSlice";

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();

  // --- Local Split Revenue ---
  const [splitRevenue, setSplitRevenue] = useState({
    total: 0,
    gcash: 0,
    cash: 0,
  });

  // Fetch GCASH + CASH + TOTAL from your new API
  useEffect(() => {
    async function loadSplitRevenue() {
      try {
        const res = await fetch("/api/reports/revenue");
        const data = await res.json();

        setSplitRevenue({
          total: data.amount ?? 0, // <-- FIXED (was data.total)
          gcash: data.gcash ?? 0,
          cash: data.cash ?? 0,
        });
      } catch (err) {
        console.error("Failed to load split revenue:", err);
      }
    }

    loadSplitRevenue();
  }, []);

  // Orders
  const {
    orders,
    status,
    error: orderError,
  } = useAppSelector((state) => state.order);

  // Most sold
  const { items: mostSoldItems, loading: mostSoldLoading } = useAppSelector(
    (state) => state.mostSold
  );

  // Revenue
  const {
    amount,
    loading: revenueLoading,
    error: revenueError,
  } = useAppSelector(selectRevenue);

  // Weekly sales
  const {
    items: weeklyItems,
    totalRevenue,
    totalItemsSold,
    loading: weeklyLoading,
    error: weeklyError,
  } = useAppSelector(selectWeeklySales);

  // Total Orders
  const {
    total: totalOrders,
    loading: totalLoading,
    error: totalError,
  } = useAppSelector((state) => state.totalOrder);

  // Monthly Revenue
  const { monthlyData, loading: monthlyLoading } =
    useAppSelector(selectMonthlyRevenue);

  // Fetch orders
  useEffect(() => {
    if (orders.length === 0 && status !== "loading" && status !== "success") {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length, status]);

  // Fetch most sold
  useEffect(() => {
    if (mostSoldItems.length === 0 && !mostSoldLoading) {
      dispatch(fetchMostSold());
    }
  }, [dispatch, mostSoldItems.length, mostSoldLoading]);

  // Fetch revenue (for chart)
  useEffect(() => {
    if (amount === null && !revenueLoading) {
      dispatch(fetchRevenue());
    }
  }, [dispatch, amount, revenueLoading]);

  // Fetch weekly sales
  useEffect(() => {
    if (weeklyItems.length === 0 && !weeklyLoading) {
      dispatch(fetchWeeklySales() as any);
    }
  }, [dispatch, weeklyItems.length, weeklyLoading]);

  // Fetch total orders
  useEffect(() => {
    if (totalOrders === null && !totalLoading) {
      dispatch(fetchTotalOrders());
    }
  }, [dispatch, totalOrders, totalLoading]);

  // Fetch monthly revenue
  useEffect(() => {
    if (monthlyData.length === 0 && !monthlyLoading) {
      dispatch(fetchMonthlyRevenue());
    }
  }, [dispatch, monthlyData.length, monthlyLoading]);

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-6 bg-gray-100 space-y-6">

        {/* --- TOP CARDS --- */}
        <div className="grid grid-cols-3 gap-4">

          {/* Weekly Summary */}
          <WeekSales
            items={weeklyItems}
            totalRevenue={totalRevenue}
            totalItemsSold={totalItemsSold}
            loading={weeklyLoading}
          />

          {/* Today's Revenue (local API split) */}
          <TodayRevenue
            amount={splitRevenue.total}
            gcash={splitRevenue.gcash}
            cash={splitRevenue.cash}
            loading={revenueLoading}
            error={revenueError}
          />

          {/* Total Orders */}
          <TotalOrder
            amount={totalOrders ?? 0}
            chartData={weeklyItems}
            loading={totalLoading}
            error={totalError}
            label="Total Completed & Paid Orders"
          />
        </div>

        {/* --- CHARTS --- */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex">
            <RevenueChart className="flex-1" />
          </div>
          <div className="col-span-1 flex">
            <MostSoldItemsCard items={mostSoldItems} className="flex-1" />
          </div>
        </div>

        {/* --- LATEST ORDERS --- */}
        {status === "success" && orders.length > 0 ? (
          <LatestOrdersCard orders={orders} />
        ) : status === "loading" ? (
          <div>Loading...</div>
        ) : (
          <div>No orders yet</div>
        )}

        {weeklyError && (
          <div className="text-red-500">Weekly Sales Error: {weeklyError}</div>
        )}
      </div>
    </div>
  );
}
