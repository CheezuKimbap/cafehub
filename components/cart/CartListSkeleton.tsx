"use client";

export function CartListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex-1 flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 border rounded-lg shadow-sm animate-pulse bg-white"
        >
          {/* Image placeholder */}
          <div className="w-20 h-20 bg-gray-200 rounded-lg" />

          {/* Details placeholder */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="w-3/4 h-4 bg-gray-200 rounded" />
            <div className="w-1/2 h-4 bg-gray-200 rounded" />
          </div>

          {/* Quantity / actions placeholder */}
          <div className="flex flex-col gap-2 items-end">
            <div className="w-12 h-4 bg-gray-200 rounded" />
            <div className="w-8 h-4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
