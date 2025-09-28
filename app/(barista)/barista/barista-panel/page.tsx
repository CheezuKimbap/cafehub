"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchProducts } from "@/redux/features/products/productsSlice";
import { fetchAddons } from "@/redux/features/addons/addonsSlice";
import {
  addItemToCart,
  fetchCart,
  removeCartItem,
} from "@/redux/features/cart/cartSlice";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

export default function BaristaPOS() {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const products = useAppSelector((state) => state.products.items);
  const addons = useAppSelector((state) => state.addon.list);
  const cart = useAppSelector((state) => state.cart.cart);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<
    { addonId: string; quantity: number }[]
  >([]);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchAddons());
    if (customerId) dispatch(fetchCart(customerId));
  }, [dispatch, customerId]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addonId);
      if (exists) return prev.filter((a) => a.addonId !== addonId);
      return [...prev, { addonId, quantity: 1 }];
    });
  };

  const handleAddToCart = () => {
    if (!customerId || !selectedProduct) return;
    dispatch(
      addItemToCart({
        customerId,
        productId: selectedProduct,
        quantity,
        servingType: "HOT",
        addons: selectedAddons,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchCart(customerId));
        setSelectedProduct(null);
        setSelectedAddons([]);
        setQuantity(1);
      })
      .catch(() => alert("Failed to add item to cart"));
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeCartItem(itemId));
  };

  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((acc, item) => {
      const productPrice = item.product?.price ?? 0;
      const base = productPrice * item.quantity;
      const addonTotal =
        item.addons?.reduce(
          (aAcc, addon) => aAcc + (addon.price ?? 0) * addon.quantity,
          0
        ) ?? 0;
      return acc + base + addonTotal;
    }, 0);
  }, [cart]);

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
                    <DialogClose asChild>
                      <Button variant="outline" size="sm">
                        ✕
                      </Button>
                    </DialogClose>
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

                  {/* Addons */}
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {addons.map((a) => (
                      <label key={a.id} className="flex items-center gap-2">
                        <Checkbox
                          checked={
                            !!selectedAddons.find((s) => s.addonId === a.id)
                          }
                          onCheckedChange={() => toggleAddon(a.id)}
                        />
                        {a.name} (+₱{a.price})
                      </label>
                    ))}
                  </div>

                  {/* Add to cart */}
                  <Button onClick={handleAddToCart} className="mt-4">
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
                <p>{item.product?.name ?? "Unknown product"}</p>
                <p>
                  Qty: {item.quantity} | ₱{item.product?.price ?? 0}
                </p>
                {item.addons?.length > 0 && (
                  <ul className="pl-4 text-sm">
                    {item.addons.map((a) => (
                      <li key={a.addonId}>
                        {a.addon?.name ?? "Unknown"} x {a.quantity} - ₱
                        {(a.price ?? 0) * a.quantity}
                      </li>
                    ))}
                  </ul>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-1"
                  onClick={() => handleRemoveItem(item.id)}
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
