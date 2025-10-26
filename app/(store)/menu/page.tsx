"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { ProductList } from "@/components/menu/ProductList";
import { Button } from "@/components/ui/button";

type SortKey = "name" | "price" | "status";

function ProductPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.products);
  const { categories, loading: catLoading, error: catError } = useAppSelector(
    (state) => state.categories
  );

  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = !selectedCategory
      ? items
      : items.filter((p) => p.categoryId === selectedCategory.id);

    if (sortKey) {
      result = [...result].sort((a, b) => {
        let aValue = a[sortKey];
        let bValue = b[sortKey];

        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, selectedCategory, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <section className="flex p-4 gap-6">
      {/* Side Nav */}
      <aside className="w-48 flex-shrink-0">
        <h2 className="text-lg font-semibold mb-4">Sort & Filter</h2>

        {/* Categories */}
        <div className="mb-6">
          <h3 className="font-medium mb-2">Categories</h3>
          {catError && <p className="text-red-500 text-sm">{catError}</p>}
          <div className="flex flex-col gap-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            {!catLoading &&
              categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory?.id === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className="rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
          </div>
        </div>

        {/* Sorting */}
        <div>
          <h3 className="font-medium mb-2">Sort By</h3>
          <div className="flex flex-col gap-2">
            {(["name", "price", "status"] as SortKey[]).map((key) => (
              <Button
                key={key}
                variant={sortKey === key ? "default" : "outline"}
                onClick={() => handleSort(key)}
              >
                {key} {sortKey === key ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </Button>
            ))}
          </div>    
        </div>
      </aside>

      {/* Product List */}
      <main className="flex-1">
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <ProductList products={filteredProducts} loading={loading} />
      </main>
    </section>
  );
}

export default ProductPage;
