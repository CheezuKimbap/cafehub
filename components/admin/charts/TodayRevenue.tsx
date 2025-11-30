// TodayRevenue.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TodayRevenueProps {
  amount: number | null;   // total revenue
  gcash: number;           // gcash revenue
  cash: number;            // cash revenue
  loading: boolean;
  error: string | null;
  title?: string;
}

export function TodayRevenue({
  amount,
  gcash,
  cash,
  loading,
  error,
  title = "Today's Revenue",
}: TodayRevenueProps) {

  // Loading
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading revenue...</div>
        </CardContent>
      </Card>
    );
  }

  // Error
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  const totalValue = amount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">

        {/* TOTAL */}
        <div>
          <p className="text-xl font-bold">
            ₱{totalValue.toLocaleString()}
          </p>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>

        <hr />

        {/* GCASH */}
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">GCASH</span>
          <span className="font-semibold">₱{gcash.toLocaleString()}</span>
        </div>

        {/* CASH */}
        <div className="flex justify-between">
          <span className="text-gray-600 text-sm">CASH</span>
          <span className="font-semibold">₱{cash.toLocaleString()}</span>
        </div>

      </CardContent>
    </Card>
  );
}
