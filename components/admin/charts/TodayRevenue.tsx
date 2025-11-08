// TodayRevenue.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// REMOVE unused LineChart imports if not using them

// 1. UPDATE INTERFACE to match Redux state
interface TodayRevenueProps {
  amount: number | null; // The revenue amount
  loading: boolean;
  error: string | null;
  title?: string;
}

// 2. UPDATE FUNCTION SIGNATURE and handle state
export function TodayRevenue({ amount, loading, error, title = "Today's Revenue" }: TodayRevenueProps) {

  // Handle Loading State
  if (loading) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><div>Loading revenue...</div></CardContent>
      </Card>
    );
  }

  // Handle Error State
  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><div className="text-red-500">Error: {error}</div></CardContent>
      </Card>
    );
  }

  // Use the amount directly when successful (defaulting to 0 if null)
  const displayValue = amount ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between gap-2 items-center">
          <div>
            <p className="text-xl font-bold">
              P{displayValue.toLocaleString()} {/* Display the revenue */}
            </p>
            <p className="text-gray-500 text-sm">Available to payout</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}