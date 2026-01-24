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

  /* ---------------- SPLIT REVENUE (LOCAL API) ---------------- */
  const [splitRevenue, setSplitRevenue] = useState({
    total: 0,
    gcash: 0,
    cash: 0,
  });

  useEffect(() => {
    async function loadSplitRevenue() {
      try {
        const res = await fetch("/api/reports/revenue");
        const data = await res.json();

        setSplitRevenue({
          total: data.amount ?? 0,
          gcash: data.gcash ?? 0,
          cash: data.cash ?? 0,
        });
      } catch (err) {
        console.error("Failed to load split revenue:", err);
      }
    }

    loadSplitRevenue();
  }, []);

  /* ---------------- FREE DRINKS METRIC (LOCAL API) ---------------- */
  const [freeDrinksRedeemed, setFreeDrinksRedeemed] = useState(0);
  const [freeDrinksLoading, setFreeDrinksLoading] = useState(false);
  const [freeDrinksError, setFreeDrinksError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFreeDrinksRedeemed() {
      try {
        setFreeDrinksLoading(true);

        const res = await fetch("/api/metrics/orders-and-redeems");
        if (!res.ok) throw new Error("Failed to fetch free drinks");

        const data = await res.json();
        setFreeDrinksRedeemed(data.freeDrinksRedeemed ?? 0);
      } catch (err: any) {
        console.error("Free drinks metric error:", err);
        setFreeDrinksError(err.message ?? "Unknown error");
      } finally {
        setFreeDrinksLoading(false);
      }
    }

    loadFreeDrinksRedeemed();
  }, []);

  /* ---------------- REDUX STATE ---------------- */
  const { orders, status } = useAppSelector((state) => state.order);

  const { items: mostSoldItems, loading: mostSoldLoading } =
    useAppSelector((state) => state.mostSold);

  const {
    amount,
    loading: revenueLoading,
    error: revenueError,
  } = useAppSelector(selectRevenue);

  const {
    items: weeklyItems,
    totalRevenue,
    totalItemsSold,
    loading: weeklyLoading,
    error: weeklyError,
  } = useAppSelector(selectWeeklySales);

  const {
    total: totalOrders,
    loading: totalLoading,
    error: totalError,
  } = useAppSelector((state) => state.totalOrder);

  const { monthlyData, loading: monthlyLoading } =
    useAppSelector(selectMonthlyRevenue);

  /* ---------------- REDUX FETCHES ---------------- */
  useEffect(() => {
    if (orders.length === 0 && status !== "loading") {
      dispatch(fetchOrders());
    }
  }, [dispatch, orders.length, status]);

  useEffect(() => {
    if (mostSoldItems.length === 0 && !mostSoldLoading) {
      dispatch(fetchMostSold());
    }
  }, [dispatch, mostSoldItems.length, mostSoldLoading]);

  useEffect(() => {
    if (amount === null && !revenueLoading) {
      dispatch(fetchRevenue());
    }
  }, [dispatch, amount, revenueLoading]);

  useEffect(() => {
    if (weeklyItems.length === 0 && !weeklyLoading) {
      dispatch(fetchWeeklySales() as any);
    }
  }, [dispatch, weeklyItems.length, weeklyLoading]);

  useEffect(() => {
    if (totalOrders === null && !totalLoading) {
      dispatch(fetchTotalOrders());
    }
  }, [dispatch, totalOrders, totalLoading]);

  useEffect(() => {
    if (monthlyData.length === 0 && !monthlyLoading) {
      dispatch(fetchMonthlyRevenue());
    }
  }, [dispatch, monthlyData.length, monthlyLoading]);

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex w-full h-full">
      <div className="flex-1 p-6 bg-gray-100 space-y-6">

        {/* TOP CARDS */}
        <div className="grid grid-cols-3 gap-4">

          <WeekSales
            items={weeklyItems}
            totalRevenue={totalRevenue}
            totalItemsSold={totalItemsSold}
            loading={weeklyLoading}
          />

          <TodayRevenue
            amount={splitRevenue.total}
            gcash={splitRevenue.gcash}
            cash={splitRevenue.cash}
            loading={revenueLoading}
            error={revenueError}
          />

          <TotalOrder
            amount={totalOrders ?? 0}
            freeDrinksRedeemed={freeDrinksRedeemed}
            chartData={weeklyItems}
            loading={totalLoading || freeDrinksLoading}
            error={totalError || freeDrinksError}
            label="Total Completed & Paid Orders"
          />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex">
            <RevenueChart className="flex-1" />
          </div>
          <div className="col-span-1 flex">
            <MostSoldItemsCard items={mostSoldItems} className="flex-1" />
          </div>
        </div>

        {/* LATEST ORDERS */}
        {status === "success" && orders.length > 0 ? (
          <LatestOrdersCard orders={orders} />
        ) : status === "loading" ? (
          <div>Loading...</div>
        ) : (
          <div>No orders yet</div>
        )}

        {weeklyError && (
          <div className="text-red-500">
            Weekly Sales Error: {weeklyError}
          </div>
        )}
      </div>
    </div>
  );
}
