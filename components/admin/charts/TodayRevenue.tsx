"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

const weeklySalesData = [
  { value: 10 },
  { value: 20 },
  { value: 15 },
  { value: 25 },
  { value: 22 },
  { value: 30 },
  { value: 28 },
];
export function TodayRevenue() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Revenue</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2">
          <div>
            <p className="text-xl font-bold">P8.2K</p>
            <p className="text-gray-500 text-sm">Available to payout</p>
          </div>
          <LineChart width={120} height={50} data={weeklySalesData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4CE13F" // Indigo (match your screenshot)
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
}
