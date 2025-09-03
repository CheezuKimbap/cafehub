"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { addItemToCart, fetchCart } from "@/redux/features/cart/cartSlice";
import { useSession } from "next-auth/react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductList } from "@/components/menu/ProductList";

function ProductPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { items, loading, error } = useAppSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleAddToCart = (productId: string) => {
    if (!customerId) return alert("Please log in to add items to cart.");

    dispatch(addItemToCart({ customerId, productId, quantity: 1 }))
      .unwrap()
      .then(() => dispatch(fetchCart(customerId)))
      .catch(() => alert("Failed to add item to cart"));
  };

  return (
    <section className="p-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
        ]}
      />
      {error && <p className="text-red-500">{error}</p>}
      <ProductList
        products={items}
        loading={loading}
        onAddToCart={handleAddToCart} // pass the handler down
      />
    </section>
  );
}

export default ProductPage;
