"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between  min-w-[130px] min-h-[200px] h-full py-0">
      <CardHeader className="flex flex-col p-2 sm:p-4 animate-pulse">
        {/* Image skeleton */}
        <Skeleton className="w-full aspect-square rounded-lg bg-gray-300" />

        {/* Product name skeleton */}
        <Skeleton className="h-4 w-3/4 mt-2 bg-gray-300 rounded" />

        {/* Rating skeleton */}
        <div className="flex items-center gap-1 mt-1">
          <Skeleton className="h-4 w-4 rounded-full bg-gray-300" />
          <Skeleton className="h-4 w-10 bg-gray-300 rounded" />
        </div>

        {/* Price skeleton */}
        <Skeleton className="h-4 w-16 mt-2 bg-gray-300 rounded" />
      </CardHeader>
    </Card>
  );
}
