"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import {
  fetchBaristaCart,
  addBaristaItem,
  removeBaristaItem,
  updateBaristaItem,
  clearBaristaCart,
  selectBaristaCart,
} from "@/redux/features/cart/baristaCartSlice";
import type { RootState, AppDispatch } from "@/redux/store";
import type { CartItemAddon } from "@/redux/features/cart/cart";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";

const sampleAddons = [
  { addonId: "a1", name: "Extra Shot", price: 20 },
  { addonId: "a2", name: "Soy Milk", price: 15 },
];

export default function BaristaPOS() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: products, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const cart = useSelector(selectBaristaCart);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [servingType, setServingType] = useState<"HOT" | "COLD">("HOT");

  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  // fetch products + cart on mount
  useEffect(() => {
    if (!customerId) return;
    dispatch(fetchProducts());
    dispatch(fetchBaristaCart(customerId));
  }, [dispatch, customerId]);

  const toggleAddon = (addon: { addonId: string; name: string; price: number }) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addon.addonId);
      if (exists) {
        return prev.filter((a) => a.addonId !== addon.addonId);
      }
      return [
        ...prev,
        {
          addonId: addon.addonId,
          quantity: 1,
          price: addon.price,
          addon: { name: addon.name, price: addon.price },
        },
      ];
    });
  };

  const handleAddToCart = (p: any) => {
    if (!customerId) return;

    const addonsPayload = selectedAddons.map((a) => ({
      addonId: a.addonId,
      quantity: a.quantity,
      price: a.price,
      addon: a.addon, // contains { name, price }
    }));

    dispatch(
      addBaristaItem({
        customerId,
        productId: p.id,
        quantity,
        servingType, // HOT or COLD
        addons: addonsPayload,
      })
    ).then(() => {
      dispatch(fetchBaristaCart(customerId)); // refresh after add
    });

    // reset dialog state
    setSelectedProduct(null);
    setSelectedAddons([]);
    setQuantity(1);
    setServingType("HOT");
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!customerId) return;
    dispatch(removeBaristaItem(itemId)).then(() => {
      dispatch(fetchBaristaCart(customerId));
    });
  };

  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((acc, item) => {
      const base = (item.product?.price || 0) * item.quantity;
      const addonTotal =
        item.addons?.reduce(
          (aAcc, addon) => aAcc + (addon.price || addon.addon.price) * addon.quantity,
          0
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
                {/* Left - Product Image */}
                <div className="w-1/3 p-4 flex items-center justify-center border-r">
                  <img
                    src={p.image || "/placeholder.png"}
                    alt={p.name}
                    className="object-contain w-full h-48 rounded"
                  />
                </div>

                {/* Right - Details */}
                <div className="w-2/3 flex flex-col p-6 gap-4">
                  <div className="flex justify-between items-center">
                    <DialogTitle className="text-lg font-semibold">
                      {p.name}
                    </DialogTitle>
                  </div>

                  {/* Quantity selector */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </Button>
                    <span>{quantity}</span>
                    <Button onClick={() => setQuantity((q) => q + 1)}>+</Button>
                  </div>

                  {/* Serving type selector */}
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

                  {/* Addons */}
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {sampleAddons.map((a) => (
                      <label key={a.addonId} className="flex items-center gap-2">
                        <Checkbox
                          checked={!!selectedAddons.find((s) => s.addonId === a.addonId)}
                          onCheckedChange={() => toggleAddon(a)}
                        />
                        {a.name} (+₱{a.price})
                      </label>
                    ))}
                  </div>

                  {/* Add to cart */}
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
                <p className="text-sm italic">Serving: {item.servingType}</p>
                {item.addons?.length > 0 && (
                  <ul className="pl-4 text-sm">
                    {item.addons.map((a) => (
                      <li key={a.addonId}>
                        {a.addon?.name ?? "Unknown"} x {a.quantity} - ₱
                        {(a.price || a.addon.price) * a.quantity}
                      </li>
                    ))}
                  </ul>
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
          </div>
        ) : (
          <p className="text-gray-500">Cart is empty</p>
        )}
      </div>
    </div>
  );
}
