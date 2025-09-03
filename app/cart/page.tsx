"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  addItemToCart,
} from "@/redux/features/cart/cartSlice";

import { Cart, CartItem as CartItemType } from "@/redux/features/cart/cart";

import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const { cart, status } = useAppSelector((state) => state.cart);

  const customerId = session?.user.customerId; // replace with logged-in customer

  // Fetch cart on mount
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
      <div className="flex-1 flex flex-col gap-4">
        {cart.items.map((item: CartItemType) => (
          <CartItem
            key={item.id}
            id={item.id}
            product={item.product}
            quantity={item.quantity}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <CartSummary total={total} onCheckout={handleCheckout} />
    </div>
  );
}
