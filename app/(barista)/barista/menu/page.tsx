"use client";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { ProductList } from "@/components/menu/ProductList";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useSession } from "next-auth/react";
import React, { useEffect } from "react";

function page() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { items, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <section className="p-4">
      <DynamicBreadcrumb />
      {error && <p className="text-red-500">{error}</p>}
      <ProductList
        products={items}
        loading={loading}
        // pass the handler down
      />
    </section>
  );
}

export default page;
