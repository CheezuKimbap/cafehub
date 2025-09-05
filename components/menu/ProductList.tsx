import { ProductCard } from "./ProductCard";
import { ProductCardSkeleton } from "@/components/menu/ProductSkeleton";
import type { Product } from "@/redux/features/products/product";

export function ProductList({
  products,
  loading,
}: {
  products?: Product[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#F4F1EB] p-8 rounded-2xl my-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="bg-[#F4F1EB] p-8 rounded-2xl my-4 text-center">
        <p className="text-muted-foreground">No products available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-[#F4F1EB] p-8 rounded-2xl my-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          description={p.description}
          price={p.price}
          imageUrl={p.image ?? undefined}
        />
      ))}
    </div>
  );
}
