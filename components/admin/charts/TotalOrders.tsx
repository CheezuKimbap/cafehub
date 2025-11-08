"use client";

import { LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TotalOrderProps = {
  amount: number | string;
  chartData: { value: number }[];
  label?: string;
  loading?: boolean;
  error?: string | null;
};

export function TotalOrder({
  amount,
  chartData,
  label = "Available to Payout",
  loading,
  error,
}: TotalOrderProps) {
  if (loading) return <Card><CardContent>Loading...</CardContent></Card>;
  if (error) return <Card><CardContent className="text-red-500">Error: {error}</CardContent></Card>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2 items-center">
          <div>
            <p className="text-xl font-bold">{amount}</p>
            <p className="text-gray-500 text-sm">{label}</p>
          </div>
          <LineChart width={120} height={50} data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#F29A2E"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </div>
      </CardContent>
    </Card>
  );
}
