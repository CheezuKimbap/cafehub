"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { addItemToCart, fetchCart } from "@/redux/features/cart/cartSlice";
import { useSession } from "next-auth/react";
import { ProductList } from "@/components/menu/ProductList";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { Button } from "@/components/ui/button";

function ProductPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { items, loading, error } = useAppSelector((state) => state.products);
  const { categories, loading: catLoading, error: catError } = useAppSelector(
    (state) => state.categories
  );

  // Selected category (can be null for "All")
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch products and categories
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter products by categoryId
  const filteredProducts = !selectedCategory
    ? items
    : items.filter((p) => p.categoryId === selectedCategory.id);

  return (
    <section className="p-4">
      {/* Category Section */}
      <div className="my-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Categories</h2>

        {catError && (
          <p className="text-red-500 text-sm mb-2">
            Failed to load categories: {catError}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          {/* "All" Button */}
          <Button
            variant={!selectedCategory ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="rounded-full"
          >
            All
          </Button>

          {/* Category Buttons */}
          {!catLoading &&
            categories.map((cat) => (
              <Button
                key={cat.id}
                variant={
                  selectedCategory?.id === cat.id ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(cat)}
                className="rounded-full"
              >
                {cat.name}
              </Button>
            ))}
        </div>
      </div>

      {/* Error State */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Product List */}
      <ProductList
        products={filteredProducts}
        loading={loading}
        // You can pass add-to-cart handler here if needed
      />
    </section>
  );
}

export default ProductPage;
