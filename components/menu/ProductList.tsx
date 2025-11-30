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
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 auto-rows-fr">
        {Array.from({ length: 24 }).map((_, i) => (
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
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 auto-rows-fr">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          rating={p.avgRating}
          description={p.description}
          variants={p.variants}
          imageUrl={p.image ?? undefined}
           hasRating={true}
                                    hasPrice={false}
                                    hasCompactPrice={true}
                                    hasDescription={false}
        />
      ))}
    </div>
  );
}
