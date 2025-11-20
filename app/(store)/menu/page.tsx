"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { ProductList } from "@/components/menu/ProductList";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "name" | "price";

function ProductPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.products);
  const {
    categories,
    loading: catLoading,
    error: catError,
  } = useAppSelector((state) => state.categories);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    dispatch(fetchProducts({featured: false}));
    dispatch(fetchCategories());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    let result = items.filter((p: any) => p.status === "AVAILABLE");

    if (selectedCategories.size > 0) {
      result = result.filter((p: any) => selectedCategories.has(p.categoryId));
    }

    if (sortKey) {
      result = result.sort((a: any, b: any) => {
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
  }, [items, selectedCategories, sortKey, sortOrder]);

  const handleCategoryChange = (id: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCategories(newSet);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  return (
    <section className="flex flex-col md:flex-row p-4 gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-48 flex-shrink-0 space-y-6">
        <h2 className="text-lg font-semibold mb-2">Sort & Filter</h2>

        {/* Category Checkboxes */}
        <div>
          <h3 className="font-medium mb-2">Categories</h3>
          {catError && <p className="text-red-500 text-sm">{catError}</p>}
          {!catLoading && (
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedCategories.has(cat.id)}
                    className="border-black bg-white checked:bg-blue-500 checked:border-blue-500 h-4 w-4"
                    onCheckedChange={(checked) => {
                      // Convert to boolean (ignore "indeterminate")
                      if (checked) {
                        setSelectedCategories((prev) =>
                          new Set(prev).add(cat.id),
                        );
                      } else {
                        setSelectedCategories((prev) => {
                          const newSet = new Set(prev);
                          newSet.delete(cat.id);
                          return newSet;
                        });
                      }
                    }}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sorting Buttons */}
        <div>
          <h3 className="font-medium mb-2">Sort By</h3>
          <div className="flex gap-2">
            {(["name", "price"] as SortKey[]).map((key) => (
              <Button
                key={key}
                variant={sortKey === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleSort(key)}
                className="flex items-center gap-1"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                {sortKey === key &&
                  (sortOrder === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  ))}
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
