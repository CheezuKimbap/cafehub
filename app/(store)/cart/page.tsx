"use client";

import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
  updateCartItemOptimistic,
  updateItemQuantityLocally,
} from "@/redux/features/cart/cartSlice";
import { CartSummary } from "@/components/cart/CartSummary";
import { CartList } from "@/components/cart/CartList";
import { useSession } from "next-auth/react";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { $Enums } from "@/prisma/generated/prisma";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const cart = useAppSelector((state) => state.cart.cart);
  const status = useAppSelector((state) => state.cart.status);

  const customerId = session?.user.customerId;

  // Fetch cart on mount
  useEffect(() => {
    if (customerId) dispatch(fetchCart(customerId));
  }, [dispatch, customerId]);

  const handleUpdateQuantity = (
    itemId: string,
    quantity: number,
    callAPI: boolean,
  ) => {
    if (!cart) return;
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;

    // Optimistic UI update
    dispatch(
      updateItemQuantityLocally({
        itemId,
        quantity,
      }),
    );

    // Call backend only if confirmed (blur)
    if (callAPI) {
      dispatch(updateCartItem({ itemId, quantity }));
    }
  };

  const handleCheckout = () => {
    if (!cart) return;
    const total = cart.items.reduce((acc, item) => acc + item.price, 0);

    alert(`Proceed to checkout. Total: $${total.toFixed(2)}`);
  };

  // Remove item
  const handleRemove = (itemId: string) => {
    dispatch(removeCartItem(itemId));
  };
    const total = useMemo(() => {
    if (!cart) return 0;

    return cart.items.reduce((acc, item) => {
        // Base product total
        const productTotal = item.variant.price * item.quantity;

        // Addons total (addon price * addon quantity * cart item quantity)
        const addonsTotal = item.addons?.reduce(
        (sum, addon) =>
            sum + addon.addon.price * addon.quantity,
        0
        ) || 0;

        return acc + productTotal + addonsTotal;
    }, 0);
    }, [cart]);


  if (status === "loading") return <p>Loading cart...</p>;
  if (!cart || cart.items.length === 0)
    return (
      <div className="p-4">
        <DynamicBreadcrumb />
        <EmptyCart />
      </div>
    );

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
