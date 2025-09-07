"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { DataTable } from "../../ui/data-table";
import { columns } from "./columns";
import { InventoryToolbar } from "./InventoryToolbar";
import { Button } from "@/components/ui/button";
import { AddProductButton } from "./AddProduct";

export default function InventoryTable() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {loading ? (
        <p className="p-4">Loading products...</p>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={items}
            actions={<AddProductButton />}
          />
        </>
      )}
    </div>
  );
}
