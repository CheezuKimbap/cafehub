"use client";

import {
  LineChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeekSaleItem {
  day: string;
  value: number; // revenue
  itemsSold: number; // number of orders sold that day
}

interface WeekSalesProps {
  items?: WeekSaleItem[]; // optional, defaults to empty
  totalRevenue?: number;
  totalItemsSold?: number;
  loading?: boolean;
}

export function WeekSales({
  items = [],
  totalRevenue = 0,
  totalItemsSold = 0,
  loading = false,
}: WeekSalesProps) {
  const chartData = items.length
    ? items
    : [{ day: "N/A", value: 0, itemsSold: 0 }];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Weekly Sales</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Totals */}
        <div className="flex flex-col">
          <p className="text-2xl font-semibold text-gray-900">
            ₱{totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {loading ? "Loading..." : `We have sold ${totalItemsSold} items`}
          </p>
        </div>

        {/* Mini line chart */}
        <div className="w-full sm:w-48 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis dataKey="day" hide />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                formatter={(value: number) => `P${value.toLocaleString()}`}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
