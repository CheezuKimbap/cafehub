"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Store hours & day options
const STORE_OPEN = 9;   // 9 AM
const STORE_CLOSE = 22; // 10 PM
const dayOptions = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Day After Tomorrow", offset: 2 },
];

export default function BaristaPOS() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { items: products, loading, error } = useSelector((s: RootState) => s.products);
  const cart = useSelector((s: RootState) => s.baristaCart.cart);
  const { list: addons, loading: addonsLoading } = useSelector((s: RootState) => s.addon);
  const { loading: checkoutLoading, error: checkoutError, order } = useSelector((s: RootState) => s.checkout);

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [pickUpDay, setPickUpDay] = useState<string | null>("0");
  const [pickUpTime, setPickUpTime] = useState<string | null>("ASAP");
  const [orderName, setOrderName] = useState<string | null>(null);

  // Fetch essentials
  useEffect(() => {
    if (!customerId) return;
    dispatch(fetchProducts());
    dispatch(fetchBaristaCart(customerId));
    dispatch(fetchAddons());
  }, [dispatch, customerId]);

  // Refresh cart on order complete
  useEffect(() => {
    if (order && customerId) {
      dispatch(fetchBaristaCart(customerId));
    }
  }, [order, customerId, dispatch]);

  // Auto-select ASAP for today
  useEffect(() => {
    if (Number(pickUpDay ?? 0) === 0) {
      setPickUpTime("ASAP");
    } else {
      setPickUpTime(null);
    }
  }, [pickUpDay]);

  // Toggle addons
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

  // Add to cart
  const handleAddToCart = (p: any) => {
    if (!customerId || !selectedVariant) return;

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
        variantId: selectedVariant,
        quantity,
        addons: addonsPayload,
      })
    ).then(() => {
      dispatch(fetchBaristaCart(customerId));
    });

    setSelectedProduct(null);
    setSelectedAddons([]);
    setQuantity(1);
    setSelectedVariant(null);
  };

  // Remove from cart
  const handleRemoveFromCart = (itemId: string) => {
    if (!customerId) return;
    dispatch(removeBaristaItem(itemId)).then(() => {
      dispatch(fetchBaristaCart(customerId));
    });
  };

  // Checkout
  const handleCheckout = () => {
    if (!customerId) return;

    let finalPickupTime: string | undefined = undefined;
    const now = new Date();
    const pickupDate = new Date();
    pickupDate.setDate(now.getDate() + Number(pickUpDay ?? 0));

    if (pickUpTime === "ASAP") {
      const nearest = new Date(now);
      nearest.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
      nearest.setSeconds(0);
      nearest.setMilliseconds(0);
      pickupDate.setHours(nearest.getHours());
      pickupDate.setMinutes(nearest.getMinutes());
    } else if (pickUpTime) {
      const [hours, minutes] = pickUpTime.split(":");
      pickupDate.setHours(Number(hours));
      pickupDate.setMinutes(Number(minutes));
    }

    pickupDate.setSeconds(0);
    pickupDate.setMilliseconds(0);
    finalPickupTime = pickupDate.toISOString();

    dispatch(
      checkout({
        customerId,
        discountId: undefined,
        orderName: orderName ?? undefined,
        pickupTime: finalPickupTime,
      })
    )
      .unwrap()
      .then(() => dispatch(fetchBaristaCart(customerId)))
      .catch(console.error);
  };

  // Compute total
  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((acc: any, item: any) => {
      const base = (item.variant?.price || 0) * item.quantity;
      const addonTotal =
        item.addons?.reduce((sum: any, a: any) => sum + (a.price || a.addon.price) * a.quantity, 0) ?? 0;
      return acc + base + addonTotal;
    }, 0);
  }, [cart]);

  if (loading) return <p className="p-6">Loading menu…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="grid grid-cols-3 gap-6 p-6">
      {/* Left: Menu */}
      <div className="col-span-2">
        <h2 className="text-xl font-semibold mb-4">Menu</h2>
        <ScrollArea className="h-[80vh] pr-2">
          <div className="grid grid-cols-3 gap-4">
            {products
              .filter((p) => p.status === "AVAILABLE")
              .map((p) => (
                <Dialog
                  key={p.id}
                  open={selectedProduct === p.id}
                  onOpenChange={(open) => setSelectedProduct(open ? p.id : null)}
                >
                  <DialogTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1 bg-white rounded-lg border border-gray-200">
                      <CardHeader>
                        <CardTitle>{p.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {p.variants?.map((v: any) => (
                          <div key={v.id} className="flex justify-between text-sm">
                            <span>{v.servingType}</span>
                            <span>₱{v.price}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </DialogTrigger>

                  {/* Dialog */}
                  <DialogContent className="sm:max-w-3xl w-full p-0 overflow-hidden">
                    <div className="flex">
                      {/* Image */}
                      <div className="w-1/3 bg-muted flex items-center justify-center">
                        <img
                          src={p.image || "/placeholder.png"}
                          alt={p.name}
                          className="object-cover w-full h-48"
                        />
                      </div>

                      {/* Details */}
                      <div className="w-2/3 p-6 flex flex-col gap-4">
                        <DialogHeader>
                          <DialogTitle>{p.name}</DialogTitle>
                        </DialogHeader>

                        {/* Variants */}
                        <RadioGroup value={selectedVariant ?? ""} onValueChange={setSelectedVariant}>
                          {p.variants?.map((v: any) => (
                            <div key={v.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={v.id} id={`v-${v.id}`} />
                              <Label htmlFor={`v-${v.id}`}>
                                {v.servingType} - ₱{v.price}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        {/* Quantity */}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                            -
                          </Button>
                          <span>{quantity}</span>
                          <Button variant="outline" onClick={() => setQuantity((q) => q + 1)}>
                            +
                          </Button>
                        </div>

                        {/* Addons */}
                        {p.categoryId !== "bfa1cc11-dbe0-4efb-aee9-a05b0629ef4d" && (
                          <ScrollArea className="h-40 border p-2 rounded-md">
                            {addonsLoading ? (
                              <p>Loading addons...</p>
                            ) : (
                              addons.map((a: Addon) => (
                                <div key={a.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={!!selectedAddons.find((s) => s.addonId === a.id)}
                                    onCheckedChange={() => toggleAddon(a)}
                                  />
                                  <Label>
                                    {a.name} (+₱{a.price})
                                  </Label>
                                </div>
                              ))
                            )}
                          </ScrollArea>
                        )}

                        {/* Add to cart */}
                        <Button className="mt-4" disabled={!selectedVariant} onClick={() => handleAddToCart(p)}>
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
          </div>
        </ScrollArea>
      </div>

      {/* Right: Cart */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Cart</h2>
        <ScrollArea className="h-[70vh] pr-2">
          {cart?.items?.length ? (
            <div className="flex flex-col gap-3">
              {cart.items.map((item: any) => (
                <Card key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm">
                  <CardContent className="p-3 flex flex-col gap-1">
                    <p className="font-medium">{item.variant?.product?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.variant?.servingType} | Qty: {item.quantity}
                    </p>
                    <p className="text-sm">₱{item.variant?.price}</p>

                    {item.addons?.length > 0 && (
                      <ul className="pl-4 text-sm text-muted-foreground">
                        {item.addons.map((a: any) => (
                          <li key={`${item.id}-${a.addonId}`}>
                            {a.addon?.name} - ₱{(a.price || a.addon.price) * a.quantity}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button variant="destructive" size="sm" className="mt-1 self-end" onClick={() => handleRemoveFromCart(item.id)}>
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-3 font-semibold text-right">Total: ₱{total.toFixed(2)}</div>

              {/* Nickname input */}
              <div className="mt-3">
                <Label>Nickname (for Cup / Order Name)</Label>
                <Input
                  placeholder="ex. Juan, Boss, Sir Blue"
                  value={orderName ?? ""}
                  onChange={(e) => setOrderName(e.target.value)}
                />
              </div>

              {/* Pickup day */}
              <div className="mt-3">
                <Label>Pickup Day</Label>
                <Select value={pickUpDay ?? ""} onValueChange={setPickUpDay} required>
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

              {/* Pickup time */}
              <div className="mt-3">
                <Label>Pickup Time</Label>
                <Select value={pickUpTime ?? ""} onValueChange={setPickUpTime} required>
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

                      // Today → show ASAP
                      if (selectedDayOffset === 0) {
                        slots.push(<SelectItem value="ASAP" key="ASAP">ASAP</SelectItem>);
                      }

                      for (let hour = STORE_OPEN; hour < STORE_CLOSE; hour++) {
                        for (let minute of [0, 15, 30, 45]) {
                          const slot = new Date(baseDate);
                          slot.setHours(hour);
                          slot.setMinutes(minute);

                          // Skip expired times for today
                          if (selectedDayOffset === 0 && slot <= now) continue;

                          // Skip nearest slot if ASAP exists
                          if (selectedDayOffset === 0) {
                            const nearest = new Date(now);
                            nearest.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
                            nearest.setSeconds(0);
                            nearest.setMilliseconds(0);
                            if (slot.getTime() === nearest.getTime()) continue;
                          }

                          const label = slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                          slots.push(<SelectItem value={label} key={label}>{label}</SelectItem>);
                        }
                      }

                      return slots;
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {/* Checkout */}
              <Button className="mt-2 w-full" onClick={handleCheckout} disabled={checkoutLoading || !cart?.items?.length}>
                {checkoutLoading ? "Processing..." : "Checkout"}
              </Button>

              {checkoutError && <p className="text-red-500">{checkoutError}</p>}
              {order && (
                <p className="text-green-600 text-sm mt-2">
                  ✅ Order placed! ID: {order.id}
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Cart is empty</p>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
