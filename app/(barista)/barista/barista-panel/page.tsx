"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import {
  fetchBaristaCart,
  addBaristaItem,
  removeBaristaItem,
} from "@/redux/features/cart/baristaCartSlice";
import { fetchAddons } from "@/redux/features/addons/addonsSlice";
import { checkout } from "@/redux/features/checkout/checkoutSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import type { CartItemAddon } from "@/redux/features/cart/cart";
import { Addon } from "@/prisma/generated/prisma";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

export default function BaristaPOS() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const {
    items: products,
    loading,
    error,
  } = useSelector((state: RootState) => state.products);
  const cart = useSelector((state: RootState) => state.baristaCart.cart);
  const { list: addons, loading: addonsLoading } = useSelector(
    (state: RootState) => state.addon,
  );
  const {
    loading: checkoutLoading,
    error: checkoutError,
    order,
  } = useSelector((state: RootState) => state.checkout);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [servingType, setServingType] = useState<"HOT" | "COLD">("HOT");

  // --- Fetch products, cart, addons on mount ---
  useEffect(() => {
    if (!customerId) return;
    dispatch(fetchProducts());
    dispatch(fetchBaristaCart(customerId));
    dispatch(fetchAddons());
  }, [dispatch, customerId]);

  // --- Refresh cart after checkout ---
  useEffect(() => {
    if (order && customerId) {
      dispatch(fetchBaristaCart(customerId));
    }
  }, [order, customerId, dispatch]);

  // --- Addon toggle ---
  const toggleAddon = (addon: { id: string; name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addon.id);
      if (exists) return prev.filter((a) => a.addonId !== addon.id);
      return [
        ...prev,
        {
          addonId: addon.id,
          quantity: 1,
          price: addon.price,
          addon: { name: addon.name, price: addon.price },
        },
      ];
    });
  };

  // --- Add item to cart ---
  const handleAddToCart = (p: any) => {
    if (!customerId) return;

    const addonsPayload = selectedAddons.map((a) => ({
      addonId: a.addonId,
      quantity: a.quantity,
      price: a.price,
      addon: a.addon,
    }));

    dispatch(
      addBaristaItem({
        customerId,
        productId: p.id,
        quantity,
        servingType,
        addons: addonsPayload,
      }),
    ).then(() => {
      dispatch(fetchBaristaCart(customerId));
    });

    setSelectedProduct(null);
    setSelectedAddons([]);
    setQuantity(1);
    setServingType("HOT");
  };

  // --- Remove item from cart ---
  const handleRemoveFromCart = (itemId: string) => {
    if (!customerId) return;
    dispatch(removeBaristaItem(itemId)).then(() => {
      dispatch(fetchBaristaCart(customerId));
    });
  };

  // --- Checkout action directly inside page ---
  const handleCheckout = () => {
    if (!customerId) return;

    dispatch(checkout({ customerId }))
      .unwrap() // unwrap the promise to catch success/failure
      .then(() => {
        // Refresh cart after successful checkout
        dispatch(fetchBaristaCart(customerId));
      })
      .catch((err) => {
        console.error("Checkout failed:", err);
      });
  };

  // --- Cart total calculation ---
  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((acc, item) => {
      const base = (item.product?.price || 0) * item.quantity;
      const addonTotal =
        item.addons?.reduce(
          (aAcc, addon) =>
            aAcc + (addon.price || addon.addon.price) * addon.quantity,
          0,
        ) ?? 0;
      return acc + base + addonTotal;
    }, 0);
  }, [cart]);

  if (loading) return <p className="p-6">Loading menu…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-3 gap-6 p-6 relative">
      {/* Product Menu */}
      <div className="col-span-2">
        <h2 className="text-xl font-bold mb-4">Menu</h2>
        <div className="grid grid-cols-3 gap-4">
          {products.map((p) => (
            <Dialog
              key={p.id}
              open={selectedProduct === p.id}
              onOpenChange={(open) => setSelectedProduct(open ? p.id : null)}
            >
              <DialogTrigger asChild>
                <button className="p-4 rounded-lg border hover:bg-gray-100">
                  {p.name} - ₱{p.price}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl w-full flex p-0 overflow-hidden">
                <div className="w-1/3 p-4 flex items-center justify-center border-r">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.name}
                    className="object-contain w-full h-48 rounded"
                  />
                </div>
                <div className="w-2/3 flex flex-col p-6 gap-4">
                  <DialogTitle className="text-lg font-semibold">
                    {p.name}
                  </DialogTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <span>{quantity}</span>
                    <Button onClick={() => setQuantity((q) => q + 1)}>+</Button>
                  </div>

                       {p.categoryId != "bfa1cc11-dbe0-4efb-aee9-a05b0629ef4d" && (
                            <>
                                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="HOT"
                        checked={servingType === "HOT"}
                        onChange={() => setServingType("HOT")}
                      />
                      Hot
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="COLD"
                        checked={servingType === "COLD"}
                        onChange={() => setServingType("COLD")}
                      />
                      Cold
                    </label>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {addonsLoading ? (
                      <p>Loading addons...</p>
                    ) : addons.length ? (
                      addons.map((a: Addon) => (
                        <label key={a.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={
                              !!selectedAddons.find((s) => s.addonId === a.id)
                            }
                            onCheckedChange={() => toggleAddon(a)}
                          />
                          {a.name} (+₱{a.price})
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        No addons available
                      </p>
                    )}
                  </div>
                            </>
                            )}


                  <Button className="mt-4" onClick={() => handleAddToCart(p)}>
                    Add to Cart
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div>
        <h2 className="text-xl font-bold mb-4">Cart</h2>
        {cart?.items?.length ? (
          <div className="flex flex-col gap-2">
            {cart.items.map((item) => (
              <div key={item.id} className="border p-2 rounded">
                <p>{item.product?.name}</p>
                <p>
                  Qty: {item.quantity} | ₱{item.product?.price}
                </p>

                  {item.product.categoryId != "bfa1cc11-dbe0-4efb-aee9-a05b0629ef4d" && (
                            <> <p className="text-sm italic">Serving: {item.servingType}</p>
                {item.addons?.length > 0 && (
                  <ul className="pl-4 text-sm">
                    {item.addons.map((a) => (
                      <li key={a.addonId}>
                        {a.addon?.name ?? "Unknown"} x {a.quantity} - ₱
                        {(a.price || a.addon.price) * a.quantity}
                      </li>
                    ))}
                  </ul>
                )}</>
                  )}

                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-1"
                  onClick={() => handleRemoveFromCart(item.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <p className="mt-2 font-semibold">Total: ₱{total.toFixed(2)}</p>

            {/* Checkout button directly in page */}
            <div className="mt-4">
              <Button
                onClick={handleCheckout}
                disabled={checkoutLoading || !cart?.items?.length}
                className="w-full"
              >
                {checkoutLoading ? "Processing..." : "Checkout"}
              </Button>

              {checkoutError && (
                <p className="text-red-500 mt-2">{checkoutError}</p>
              )}

              {order && (
                <p className="text-green-600 mt-2">
                  ✅ Order placed successfully! Order ID: {order.id}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Cart is empty</p>
        )}
      </div>
    </div>
  );
}
