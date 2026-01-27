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
import { buyProduct } from "@/redux/features/buyout/buyoutSlice";
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductReviews } from "../reviews/ReviewSection";
import { fetchDiscounts, selectDiscounts } from "@/redux/features/discount/discountSlice";
import { Label } from "../ui/label";

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

  const [buyNowOpen, setBuyNowOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState<{ addonId: string; quantity: number }[]>([]);
  const [pickupTime, setPickupTime] = useState<string>(new Date().toISOString().slice(0, 16));
  const [selectedDiscountId, setSelectedDiscountId] = useState<string | null>(null);

  const cart = useAppSelector((state) => state.cart.cart);
  const productState = useAppSelector((state) => state.products);
  const addonsState = useAppSelector((state) => state.addon);
  const discounts = useAppSelector(selectDiscounts);

  const dayOptions = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Day After Tomorrow", offset: 2 },
    ];

    const STORE_OPEN = 8; // 8 AM
    const STORE_CLOSE = 21; // 9 PM

    const [pickUpDay, setPickUpDay] = useState<string | null>("0"); // default to Today
    const [pickUpTime, setPickUpTime] = useState<string | null>("ASAP"); // default ASAP



  useEffect(() => {
    if (productId) dispatch(fetchProductById(productId));
    dispatch(fetchAddons());
    if (customerId) dispatch(fetchDiscounts(customerId));
  }, [dispatch, productId, customerId]);

  const { selected: product, loading, error } = productState;

  const selectedVariant = useMemo(() => {
    return product?.variants.find((v) => v.id === selectedVariantId) || product?.variants[0];
  }, [product, selectedVariantId]);

  const toggleAddon = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.addonId === addonId)
        ? prev.filter((a) => a.addonId !== addonId)
        : [...prev, { addonId, quantity: 1 }]
    );
  };

  const animateToCart = () => {
    const img = document.querySelector<HTMLImageElement>("#product-image");
    const cartIcon = document.querySelector<HTMLDivElement>("#cart-icon");
    if (!img || !cartIcon) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
    clone.style.zIndex = "9999";
    clone.style.borderRadius = "8px";
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "40px";
      clone.style.height = "40px";
      clone.style.opacity = "0.4";
    });

    setTimeout(() => {
      clone.remove();
    }, 800);
  };

  const handleAddToCart = () => {
    if (!customerId) return toast.warning("Please log in to add items to cart.");
    if (!productId || !selectedVariant) return;

    const existingItem = cart?.items?.find(
      (item) =>
        item.variantId === selectedVariant.id &&
        JSON.stringify(item.addons?.map((a: any) => a.addonId).sort()) ===
          JSON.stringify(selectedAddons.map((a) => a.addonId).sort())
    );

    if (existingItem) {
      dispatch(
        addItemToCart({
          customerId,
          variantId: selectedVariant.id,
          quantity: existingItem.quantity + quantity,
          addons: selectedAddons,
        })
      )
        .unwrap()
        .then(() => dispatch(fetchCart(customerId)))
        .catch(() => toast.error("Failed to update cart"));
    } else {
      dispatch(
        addItemToCart({
          customerId,
          variantId: selectedVariant.id,
          quantity,
          addons: selectedAddons,
        })
      )
        .unwrap()
        .then(() => dispatch(fetchCart(customerId)))
        .catch(() => toast.error("Failed to add item to cart"));
    }

    animateToCart();
  };

  const handleBuyNow = async () => {
    if (!customerId || !selectedVariant) return toast.warning("Please log in to place an order.");

    // Calculate total for discount application
    let totalPrice = (selectedVariant?.price ?? 0) * quantity;
    selectedAddons.forEach((a) => {
      const addon = addonsState.list.find((ad) => ad.id === a.addonId);
      if (addon) totalPrice += addon.price * a.quantity;
    });

   let discountAmount = 0;
    const discount = discounts.find((d) => d.id === selectedDiscountId);
    if (discount) {
    if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
        discountAmount = (totalPrice * discount.discountAmount) / 100;
    } else if (discount.type === "FIXED_AMOUNT" && discount.discountAmount) {
        discountAmount = Math.min(discount.discountAmount, totalPrice);
    }
    }


    const finalTotal = totalPrice - discountAmount;

    try {
      await dispatch(
        buyProduct({
          customerId,
          variantId: selectedVariant.id,
          quantity,
          addons: selectedAddons,
          paymentType: "CASH",
          paymentProvider: "MANUAL",
          pickupTime,
          discountId: selectedDiscountId ?? undefined,
        })
      ).unwrap();

      toast.success(`Order placed successfully! Total: ₱${finalTotal.toFixed(2)}`);
      setBuyNowOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order");
    }
  };

  if (!productId) return <div className="m-4">Invalid product ID</div>;
  if (loading) return <div className="m-4">Loading...</div>;
  if (error) return <div className="m-4 text-red-600">Error: {error}</div>;
  if (!product) return <div className="m-4">Product not found</div>;

  const totalPrice =
    (selectedVariant?.price ?? 0) * quantity +
    selectedAddons.reduce((sum, a) => {
      const addon = addonsState.list.find((ad) => ad.id === a.addonId);
      return sum + (addon?.price ?? 0) * a.quantity;
    }, 0);

  return (
    <>
      <Card className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border grid md:grid-cols-2 gap-10 my-4">
        {/* Left - Image */}
        <div className="flex justify-center items-center">
          <img
            id="product-image"
            src={product.image || "/placeholder.png"}
            alt={product.name}
            className="rounded-lg shadow-md max-h-[400px] object-contain w-full"
          />
        </div>

        {/* Right */}
        <CardContent className="flex flex-col space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-green-900">{product.name}</h1>
            <p className="text-lg font-semibold text-gray-700">
              ₱{selectedVariant?.price}
            </p>
            <p className="text-sm text-gray-500 mt-2">{product.description}</p>
          </div>

          {product.variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600 font-medium">Serving Type</label>
              <Select
                value={selectedVariantId ?? product.variants[0]?.id}
                onValueChange={(value) => setSelectedVariantId(value)}
              >
                <SelectTrigger className="w-full rounded-lg border border-gray-300 shadow-sm">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {product.variants.map((variant: any) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.servingType} {variant.size ? `- ${variant.size}` : ""} (₱
                      {variant.price})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Add-ons */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Add-ons</p>
            <div className="grid grid-cols-1 gap-2 p-2 border rounded h-48 overflow-y-auto">
              {addonsState.list.map((addon: Addon) => (
                <label
                  key={addon.id}
                  className="flex items-center gap-2 text-gray-700 bg-gray-50 p-2 rounded"
                >
                  <Checkbox
                    checked={!!selectedAddons.find((a) => a.addonId === addon.id)}
                    onCheckedChange={() => toggleAddon(addon.id)}
                  />
                  <span>{addon.name} (+₱{addon.price})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quantity + Actions */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                -
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                className="rounded-xl bg-green-600 hover:bg-green-700 text-white px-4"
              >
                Add to Cart
              </Button>
              <Button
                onClick={() => setBuyNowOpen(true)}
                className="rounded-xl bg-orange-500 hover:bg-orange-600 text-white px-6"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy Now Dialog */}
      <Dialog open={buyNowOpen} onOpenChange={setBuyNowOpen}>
        <DialogContent className="max-w-md rounded-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Buy Now</DialogTitle>
          </DialogHeader>

          {/* Cart summary */}
          <div className="space-y-2 border p-2 rounded max-h-80 overflow-y-auto">
            <div className="flex justify-between font-medium border-b pb-1 mb-1">
              <span>Item</span>
              <span>Price</span>
            </div>

            <div className="flex justify-between text-gray-700">
              <span>{product.name} ({selectedVariant?.servingType}) × {quantity}</span>
              <span>₱{((selectedVariant?.price ?? 0) * quantity).toFixed(2)}</span>
            </div>

            {selectedAddons.length > 0 && (
              <div className="pl-4 space-y-1 text-sm text-gray-600">
                {selectedAddons.map((a) => {
                  const addonData = addonsState.list.find((ad) => ad.id === a.addonId);
                  return (
                    <div key={a.addonId} className="flex justify-between">
                      <span>+ {addonData?.name} × {a.quantity}</span>
                      <span>₱{((addonData?.price ?? 0) * a.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        {/* Discount selection */}
        {discounts.length > 0 && (
        <div>
            <label className="text-sm font-medium text-gray-700">Use Discount</label>
            <Select
            value={selectedDiscountId ?? "NONE"}
            onValueChange={(val) =>
                setSelectedDiscountId(val === "NONE" ? null : val)
            }
            >
            <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select discount" />
            </SelectTrigger>
            <SelectContent>
                {discounts.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                    {d.description}
                </SelectItem>
                ))}
                <SelectItem value="NONE">No Discount</SelectItem>
            </SelectContent>
            </Select>
        </div>
        )}

{/* Pickup Day */}
<div>
  <Label>Pickup Day</Label>
  <Select
    value={pickUpDay ?? "0"}  // default to 0 (Today)
    onValueChange={(val) => setPickUpDay(val)}
    required
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select day" />
    </SelectTrigger>
    <SelectContent>
      {dayOptions.map((d) => (
        <SelectItem key={d.label} value={String(d.offset)}>
          {d.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

{/* Pickup Time */}
<div>
  <Label>Pickup Time</Label>
  <Select
    value={pickUpTime ?? "ASAP"}  // default ASAP
    onValueChange={(val) => setPickUpTime(val)}
    required
  >
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Select pickup time" />
    </SelectTrigger>
    <SelectContent>
      {(() => {
        const slots = [];
        const now = new Date();
        const selectedDayOffset = Number(pickUpDay ?? 0);

        const baseDate = new Date();
        baseDate.setDate(baseDate.getDate() + selectedDayOffset);
        baseDate.setSeconds(0);
        baseDate.setMilliseconds(0);

        // Today → allow ASAP
        if (selectedDayOffset === 0) {
          slots.push(<SelectItem key="ASAP" value="ASAP">ASAP</SelectItem>);
        }

        for (let hour = STORE_OPEN; hour < STORE_CLOSE; hour++) {
          for (let minute of [0, 15, 30, 45]) {
            const slot = new Date(baseDate);
            slot.setHours(hour, minute, 0, 0);

            // Skip past times for today
            if (selectedDayOffset === 0 && slot <= now) continue;

            const label = slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            slots.push(<SelectItem key={label} value={label}>{label}</SelectItem>);
          }
        }

        return slots;
      })()}
    </SelectContent>
  </Select>
</div>
{/* Summary */}
<div className="border-t pt-2 mt-2 space-y-1 text-sm">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span>₱{((selectedVariant?.price ?? 0) * quantity +
      selectedAddons.reduce((sum, a) => {
        const addon = addonsState.list.find((ad) => ad.id === a.addonId);
        return sum + (addon?.price ?? 0) * a.quantity;
      }, 0)
    ).toFixed(2)}</span>
  </div>

  {selectedDiscountId && selectedDiscountId !== "NONE" && (() => {
    const discount = discounts.find(d => d.id === selectedDiscountId);
    let discountAmount = 0;
    if (discount) {
      let total = (selectedVariant?.price ?? 0) * quantity;
      selectedAddons.forEach(a => {
        const addon = addonsState.list.find(ad => ad.id === a.addonId);
        if (addon) total += addon.price * a.quantity;
      });

      if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
        discountAmount = (total * discount.discountAmount) / 100;
        }
        else if (discount.type === "FIXED_AMOUNT" && discount.discountAmount) {
        discountAmount = Math.min(discount.discountAmount, total);
        }
    else if (discount.type === "FREE_ITEM") {
        // Free main product only
        discountAmount = (selectedVariant?.price ?? 0) * quantity;
        }


      return (
        <div className="flex justify-between text-green-600">
          <span>Discount ({discount.description})</span>
          <span>-₱{discountAmount.toFixed(2)}</span>
        </div>
      );
    }
    return null;
  })()}

 <div className="flex justify-between font-semibold text-lg">
  <span>Total</span>
  <span>
    ₱{(() => {
      let total = (selectedVariant?.price ?? 0) * quantity;

      selectedAddons.forEach(a => {
        const addon = addonsState.list.find(ad => ad.id === a.addonId);
        if (addon) total += addon.price * a.quantity;
      });

      const discount = discounts.find(d => d.id === selectedDiscountId);

      if (discount) {
        if (discount.type === "PERCENTAGE_OFF" && discount.discountAmount) {
          total -= (total * discount.discountAmount) / 100;
        }
        else if (discount.type === "FIXED_AMOUNT" && discount.discountAmount) {
          total -= Math.min(discount.discountAmount, total);
        }
        else if (discount.type === "FREE_ITEM") {
          // remove main product price
          total -= (selectedVariant?.price ?? 0) * quantity;
        }
      }

      return Math.max(total, 0).toFixed(2);
    })()}
  </span>
</div>

</div>




          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setBuyNowOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleBuyNow}>Confirm Buy Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Reviews */}
      <ProductReviews productId={product.id} customerId={session?.user?.customerId ?? undefined} />
    </>
  );
}
