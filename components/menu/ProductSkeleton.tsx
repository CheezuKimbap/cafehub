import { Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="flex flex-col justify-between bg-[#F4F4F4] shadow-sm">
      <CardHeader>
        <Skeleton className="w-full h-48 rounded-md animate-pulse" />
        <Skeleton className="h-5 w-3/4 mt-2 animate-pulse" />
        <div className="flex items-center gap-2 mt-1">
          <Skeleton className="h-4 w-4 rounded-full animate-pulse" />
          <Skeleton className="h-4 w-10 animate-pulse" />
        </div>
        <Skeleton className="h-5 w-16 mt-2 animate-pulse" />
      </CardHeader>

      <CardFooter className="flex justify-end">
        <Skeleton className="h-8 w-8 rounded-full animate-pulse" />
      </CardFooter>
    </Card>
  );
}
