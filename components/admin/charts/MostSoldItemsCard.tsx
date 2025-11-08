"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MostSoldItem {
  name: string;
  value: number; // percentage
}

interface MostSoldItemsCardProps {
  items: MostSoldItem[];
}

export function MostSoldItemsCard({ items }: MostSoldItemsCardProps) {
  return (
    <Card className="h-full">
      {" "}
            {/* Ensures card fills grid row height */}
            <CardHeader>
                <CardTitle>Most Sold Items</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col justify-between h-full">
                <div className="space-y-4">
                {items.map((item, index) => (
        <div key={`${item.name}-${index}`}>
            {/* Label and value */}
            <div className="flex justify-between text-sm mb-1">
            <span>{item.name}</span>
            <span>{item.value}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
                className="h-3 bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${item.value}%` }}
            />
            </div>
        </div>
        ))}

        </div>
      </CardContent>
    </Card>
  );
}
