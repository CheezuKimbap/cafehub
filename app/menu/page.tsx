"use client";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductList } from "@/components/menu/ProductList";
import { Product } from "@/types/product";
import React, { useEffect, useState } from "react";

function page() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "", // must be NEXT_PUBLIC_ to expose
          },
        });

        if (!res.ok) throw new Error("Failed to fetch products");

        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.error("Fetch error:", err.message);
      } finally {
        console.log("Fetch attempt finished");
      }
    }

    fetchProducts();
  }, []);
  return (
    <>
      <section className="p-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
          ]}
        />

        <ProductList products={products}></ProductList>
      </section>
    </>
  );
}

export default page;
