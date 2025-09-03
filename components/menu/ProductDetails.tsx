"use client";

import { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { useParams } from "next/navigation";
import { fetchProductById } from "@/redux/features/products/productsSlice";
import { useSession } from "next-auth/react";
import { addItemToCart, fetchCart } from "@/redux/features/cart/cartSlice";

export function ProductDetails() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const handleAddToCart = (productId: string) => {
    if (!customerId) return alert("Please log in to add items to cart.");

    dispatch(addItemToCart({ customerId, productId, quantity }))
      .unwrap()
      .then(() => dispatch(fetchCart(customerId)))
      .catch(() => alert("Failed to add item to cart"));
  };

  const {
    selected: product,
    loading,
    error,
  } = useAppSelector((state) => state.products);

  const [quantity, setQuantity] = useState(1);
  const [temperature, setTemperature] = useState<"Hot" | "Iced">("Hot");

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId]);

  // Handle loading / error / invalid ID
  if (!productId) return <div className="m-4">Invalid product ID</div>;
  if (loading) return <div className="m-4">Loading...</div>;
  if (error) return <div className="m-4 text-red-600">Error: {error}</div>;
  if (!product) return <div className="m-4">Product not found</div>;

  return (
    <Card className="w-full shadow-lg rounded-2xl p-6 grid md:grid-cols-2 gap-10 bg-white my-4">
      {/* Left - Product Image */}
      <div className="flex justify-center items-center">
        <img
          src={product.image || "/placeholder.png"} // dynamic image
          alt={product.name}
          className="rounded-lg shadow-md max-h-[400px] object-contain w-full"
        />
      </div>

      {/* Right - Product Info */}
      <CardContent className="flex flex-col space-y-6">
        {/* Title + Price */}
        <div>
          <h1 className="text-3xl font-bold text-green-900">{product.name}</h1>
          <p className="text-lg font-semibold text-gray-700">
            ₱{product.price}
          </p>
          <p className="text-sm text-gray-500 mt-2">{product.description}</p>
        </div>

        {/* Temperature Options */}
        <div className="flex gap-3">
          <Button
            variant={temperature === "Hot" ? "default" : "outline"}
            onClick={() => setTemperature("Hot")}
            className="px-6 rounded-xl"
          >
            Hot
          </Button>
          <Button
            variant={temperature === "Iced" ? "default" : "outline"}
            onClick={() => setTemperature("Iced")}
            className="px-6 rounded-xl"
          >
            Iced
          </Button>
        </div>

        {/* Add-ons */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Add-ons</p>
          <Select>
            <SelectTrigger className="w-full rounded-xl">
              <SelectValue placeholder="Select add-ons" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="whipped-cream">Whipped Cream</SelectItem>
              <SelectItem value="extra-shot">Extra Espresso Shot</SelectItem>
              <SelectItem value="oat-milk">Oat Milk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount */}
        <div className="border rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Checkbox id="discount" />
            <label
              htmlFor="discount"
              className="text-sm font-medium text-gray-700"
            >
              Use Discount voucher?
            </label>
          </div>
          <ul className="list-disc pl-6 text-xs text-gray-500">
            <li>One time use only</li>
            <li>Only affects 1 item</li>
          </ul>
        </div>
        {/* Quantity + Add to Cart */}
        <div className="flex items-center gap-6 mt-4">
          {/* Quantity controls */}
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

          {/* Add to Cart button */}
          <Button
            onClick={() => handleAddToCart(product.id)}
            className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-6"
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
