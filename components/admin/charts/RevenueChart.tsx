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

const data = [
  { month: "Jan", profit: 100000, loss: 60000 },
  { month: "Feb", profit: 80000, loss: 55000 },
  { month: "Mar", profit: 60000, loss: 30000 },
  { month: "Apr", profit: 90000, loss: 75000 },
  { month: "May", profit: 85000, loss: 40000 },
  { month: "Jun", profit: 40000, loss: 25000 },
  { month: "Jul", profit: 70000, loss: 50000 },
  { month: "Aug", profit: 75000, loss: 48000 },
  { month: "Sep", profit: 80000, loss: 55000 },
];

export function RevenueChart() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Total Revenue</CardTitle>
        <p className="text-2xl font-bold">₱50.4K</p>
        <p className="text-sm text-green-600">↑ 5% than last month</p>
      </CardHeader>
      <CardContent>
        {/* Responsive wrapper makes chart fill parent */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="profit" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loss" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
