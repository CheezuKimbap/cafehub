"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/redux/hook";
import { selectMonthlyRevenue } from "@/redux/features/reports/monthlyRevenueSlice";

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const { monthlyData, loading, error } = useAppSelector(selectMonthlyRevenue);

  return (
    <Card className={`w-full h-full ${className ?? ""}`}>
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
        <p className="text-2xl font-bold">
          ₱{monthlyData.reduce((sum: any, m: any) => sum + m.profit, 0).toLocaleString()}
        </p>
        <p className="text-sm text-green-600">↑ Compared to last month</p>
      </CardHeader>
      <CardContent className="h-full">
        <div className="h-full w-full">
          {loading ? (
            <p>Loading chart...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} barSize={30}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="profit" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="loss" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
