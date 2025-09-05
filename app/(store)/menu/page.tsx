"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { addItemToCart, fetchCart } from "@/redux/features/cart/cartSlice";
import { useSession } from "next-auth/react";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { ProductList } from "@/components/menu/ProductList";

function ProductPage() {
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

export default ProductPage;
