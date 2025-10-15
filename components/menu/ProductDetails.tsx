"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useParams } from "next/navigation";
import { fetchProductById } from "@/redux/features/products/productsSlice";
import { fetchAddons } from "@/redux/features/addons/addonsSlice";
import { useSession } from "next-auth/react";
import { addItemToCart, fetchCart } from "@/redux/features/cart/cartSlice";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";


type Addon = {
  id: string;
  name: string;
  price: number;
};

export function ProductDetails() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const [servingType, setServingType] = useState<"HOT" | "COLD">("HOT");
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<
    { addonId: string; quantity: number }[]
  >([]);

  const productState = useAppSelector((state) => state.products);
  const addonsState = useAppSelector((state) => state.addon);
const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
    dispatch(fetchAddons()); // load addons menu
  }, [dispatch, productId]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) => {
      const exists = prev.find((a) => a.addonId === addonId);
      if (exists) {
        return prev.filter((a) => a.addonId !== addonId);
      } else {
        return [...prev, { addonId, quantity: 1 }];
      }
    });
  };

  const handleAddToCart = () => {
    if (!customerId) return alert("Please log in to add items to cart.");
    if (!productId) return;
    dispatch(
      addItemToCart({
        customerId,
        productId,
        quantity,
        servingType,
        addons: selectedAddons,
      })
    )
      .unwrap()
     .then(() => {
        dispatch(fetchCart(customerId));
        setShowPopup(true);
        })
      .catch(() => alert("Failed to add item to cart"));
  };

  const { selected: product, loading, error } = productState;

  if (!productId) return <div className="m-4">Invalid product ID</div>;
  if (loading) return <div className="m-4">Loading...</div>;
  if (error) return <div className="m-4 text-red-600">Error: {error}</div>;

  if (!product) return <div className="m-4">Product not found</div>;
    if (loading || !product) {
    return <div className="m-4">Loading product...</div>;
    }
  return (
    <Card className="w-full shadow-lg rounded-2xl p-6 grid md:grid-cols-2 gap-10 bg-white my-4">
      {/* Left - Product Image */}
      <div className="flex justify-center items-center">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="rounded-lg shadow-md max-h-[400px] object-contain w-full"
        />
      </div>

      {/* Right - Product Info */}
      <CardContent className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900">{product.name}</h1>
          <p className="text-lg font-semibold text-gray-700">
            ₱{product.price}
          </p>
          <p className="text-sm text-gray-500 mt-2">{product.description}</p>
        </div>

        {/* Temperature Options — only show if category name includes "Drink" */}
       {product.categoryId != "398c355e-599f-4d17-a016-bed3b0ca2a5a" && (
        <>
            {/* Hot / Iced buttons */}
            <div className="flex gap-3">
            <Button
                variant={servingType === "HOT" ? "default" : "outline"}
                onClick={() => setServingType("HOT")}
                className="px-6 rounded-xl"
            >
                Hot
            </Button>
            <Button
                variant={servingType === "COLD" ? "default" : "outline"}
                onClick={() => setServingType("COLD")}
                className="px-6 rounded-xl"
            >
                Iced
            </Button>
            </div>

            {/* Add-ons */}
            <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Add-ons</p>
            <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-48 p-2 border rounded">
                {addonsState.list.map((addon: Addon) => (
                <label key={addon.id} className="flex items-center gap-2 text-gray-700">
                    <Checkbox
                    checked={!!selectedAddons.find((a) => a.addonId === addon.id)}
                    onCheckedChange={() => toggleAddon(addon.id)}
                    />
                    {addon.name} (+₱{addon.price})
                </label>
                ))}
            </div>
            </div>
        </>
        )}

        {/* Add-ons */}



        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </Button>
            <span className="text-lg font-semibold w-8 text-center">
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-6"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>

      <Dialog open={showPopup} onOpenChange={setShowPopup}>
  <DialogContent className="sm:max-w-md rounded-2xl">
    <DialogHeader>
      <DialogTitle>Added to Cart!</DialogTitle>
      <DialogDescription>
        <span className="text-gray-700">
          {product.name} has been successfully added to your cart.
        </span>
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline" onClick={() => setShowPopup(false)}>
        Continue Shopping
      </Button>
      <Button
        onClick={() => {
          setShowPopup(false);
          window.location.href = "/cart"; // or use next/router push('/cart')
        }}
      >
        View Cart
      </Button>
    </div>
  </DialogContent>
</Dialog>

    </Card>
  );
}
