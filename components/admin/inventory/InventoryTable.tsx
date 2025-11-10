"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { fetchCategories } from "@/redux/features/categories/categoriesSlice";
import { DataTable } from "../../ui/data-table";
import { AddProductButton } from "./AddProduct";
import { getProductColumns } from "./columns";

export default function InventoryTable() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);
  const { categories } = useAppSelector((state) => state.categories);

  useEffect(() => {
    dispatch(fetchProducts());
    if (!categories.length) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  // Generate columns and pass categories for the edit button
  const columns = getProductColumns(categories);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {loading ? (
        <p className="p-4">Loading products...</p>
      ) : (
        <DataTable
          columns={columns}
          data={items}
          actions={<AddProductButton />}
        />
      )}
    </div>
  );
}
