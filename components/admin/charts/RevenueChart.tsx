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
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface RevenueChartProps {
  className?: string;
}

export function RevenueChart({ className }: RevenueChartProps) {
  const { monthlyData, loading, error } = useAppSelector(selectMonthlyRevenue);

  const handleDownload = () => {
    if (!monthlyData.length) return;

    const header = Object.keys(monthlyData[0]).join(",");
    const rows = monthlyData.map((d) => Object.values(d).join(",")).join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "monthly_revenue.csv");
    link.click();
  };

  return (
    <Card className={`w-full h-full ${className ?? ""}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Total Revenue</CardTitle>
            <p className="text-2xl font-bold">
              ₱
              {monthlyData
                .reduce((sum: any, m: any) => sum + m.profit, 0)
                .toLocaleString()}
            </p>
            <p className="text-sm text-green-600">↑ Compared to last month</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download
          </Button>
        </div>
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
