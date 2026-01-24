"use client";

import { LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TotalOrderProps = {
  amount: number | string;
  freeDrinksRedeemed?: number;
  chartData: { value: number }[];
  label?: string;
  loading?: boolean;
  error?: string | null;
};

export function TotalOrder({
  amount,
  freeDrinksRedeemed = 0,
  chartData,
  label = "Total Completed & Paid Orders",
  loading,
  error,
}: TotalOrderProps) {
  if (loading)
    return (
      <Card>
        <CardContent>Loading...</CardContent>
      </Card>
    );

  if (error)
    return (
      <Card>
        <CardContent className="text-red-500">
          Error: {error}
        </CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Orders</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between gap-4 items-center">
          {/* LEFT METRICS */}
          <div className="space-y-1">
            <p className="text-2xl font-bold">{amount}</p>
            <p className="text-gray-500 text-sm">{label}</p>
            <hr />
            {/* 👇 FREE DRINKS */}
            <p className="text-sm text-gray-500  mt-4 font-medium">
               Free Drinks Redeemed:{" "}
              <span className="font-semibold">
                {freeDrinksRedeemed}
              </span>
            </p>
          </div>

          {/* RIGHT CHART */}
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
