import { ProductCard } from "./ProductCard";
import type { Product } from "@/types/product";

export function ProductList({ products }: { products: Product[] }) {
  if (!products?.length) {
    return <p className="text-muted-foreground">No products available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6  bg-[#F4F1EB] p-8 rounded-2xl my-4">
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
