"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "@/redux/features/cart/cartSlice";

import { CartSummary } from "@/components/cart/CartSummary";
import { CartList } from "@/components/cart/CartList";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { cart, status } = useAppSelector((state) => state.cart);

  const customerId = session?.user.customerId;

  useEffect(() => {
    if (!customerId) return;
    dispatch(fetchCart(customerId));
  }, [dispatch, customerId]);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) return;
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleRemove = (cartItemId: string) => {
    dispatch(removeCartItem(cartItemId));
  };

  const handleCheckout = () => {
    if (!cart) return;
    const total = cart.items.reduce((acc, item) => acc + item.price, 0);
    alert(`Proceed to checkout. Total: $${total.toFixed(2)}`);
  };

  const total = cart
    ? cart.items.reduce((acc, item) => acc + item.price, 0)
    : 0;

  if (status === "loading") return <p>Loading cart...</p>;
  if (!cart || cart.items.length === 0) return <p>Your cart is empty.</p>;

  return (
    <div className="container mx-auto py-10 px-4 flex flex-col md:flex-row gap-8">
      <CartList
        items={cart.items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />
      <CartSummary total={total} onCheckout={handleCheckout} />
    </div>
  );
}
