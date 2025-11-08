"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodayRevenueProps {
  data: { value: number }[]; // array of objects with `value` key
  title?: string;
}

export function TodayRevenue({ data, title = "Today's Revenue" }: TodayRevenueProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2 items-center">
          <div>
            <p className="text-xl font-bold">
              P{data.length ? data[data.length - 1].value.toLocaleString() : 0}
            </p>
            <p className="text-gray-500 text-sm">Available to payout</p>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
