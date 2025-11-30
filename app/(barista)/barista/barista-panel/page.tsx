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
import { fetchStock } from "@/redux/features/stock/stocksSlice";

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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const STORE_OPEN = 9;
const STORE_CLOSE = 22;

const dayOptions = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Day After Tomorrow", offset: 2 },
];

export default function BaristaPOS() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session } = useSession();
  const customerId = session?.user.customerId;

  const { items: products, loading, error } = useSelector(
    (s: RootState) => s.products
  );
  const cart = useSelector((s: RootState) => s.baristaCart.cart);
  const { list: addons, loading: addonsLoading } = useSelector(
    (s: RootState) => s.addon
  );
  const { loading: checkoutLoading, error: checkoutError, order } = useSelector(
    (s: RootState) => s.checkout
  );

  const paperCups =
    useSelector((s: RootState) => s.stock.stock?.paperCupCount) ?? 0;
  const plasticCups =
    useSelector((s: RootState) => s.stock.stock?.plasticCupCount) ?? 0;

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<CartItemAddon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [pickUpDay, setPickUpDay] = useState<string | null>("0");
  const [pickUpTime, setPickUpTime] = useState<string | null>("ASAP");
  const [orderName, setOrderName] = useState<string | null>(null);

  // ⬅️ NEW
  const [paymentType, setPaymentType] = useState("CASH");

  // Load product/cart/addons/stock
  useEffect(() => {
    if (!customerId) return;

    dispatch(fetchProducts({ featured: false }));
    dispatch(fetchBaristaCart(customerId));
    dispatch(fetchAddons());
    dispatch(fetchStock());
  }, [dispatch, customerId]);

  // refresh after checkout
  useEffect(() => {
    if (order && customerId) {
      dispatch(fetchBaristaCart(customerId));
      dispatch(fetchStock());
    }
  }, [order, customerId, dispatch]);

  useEffect(() => {
    if (Number(pickUpDay ?? 0) === 0) setPickUpTime("ASAP");
    else setPickUpTime(null);
  }, [pickUpDay]);

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
    ).then(() => dispatch(fetchBaristaCart(customerId)));

    setSelectedProduct(null);
    setSelectedAddons([]);
    setQuantity(1);
    setSelectedVariant(null);
  };

  const handleRemoveFromCart = (itemId: string) => {
    if (!customerId) return;
    dispatch(removeBaristaItem(itemId)).then(() =>
      dispatch(fetchBaristaCart(customerId))
    );
  };

  const handleCheckout = () => {
    if (!customerId) return;

    const now = new Date();
    const pickupDate = new Date();
    pickupDate.setDate(now.getDate() + Number(pickUpDay ?? 0));
    pickupDate.setSeconds(0);
    pickupDate.setMilliseconds(0);

    if (pickUpTime === "ASAP") {
      const nearest = new Date(now);
      nearest.setMinutes(Math.ceil(now.getMinutes() / 15) * 15);
      pickupDate.setHours(nearest.getHours(), nearest.getMinutes(), 0, 0);
    } else if (pickUpTime) {
      const match = pickUpTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (match) {
        let hours = Number(match[1]);
        const minutes = Number(match[2]);
        const meridiem = match[3]?.toUpperCase();
        if (meridiem === "PM" && hours < 12) hours += 12;
        if (meridiem === "AM" && hours === 12) hours = 0;
        pickupDate.setHours(hours, minutes, 0, 0);
      } else {
        pickupDate.setHours(STORE_OPEN, 0, 0, 0);
      }
    } else {
      pickupDate.setHours(STORE_OPEN, 0, 0, 0);
    }

    dispatch(
      checkout({
        customerId,
        discountId: undefined, // DO NOT USE DISCOUNT
        orderName: orderName ?? undefined,
        pickupTime: pickupDate.toISOString(),
        paymentType: paymentType, // <-- CASH or GCASH
      }) as any
    )
      .unwrap()
      .then(() => {
        dispatch(fetchBaristaCart(customerId));
        dispatch(fetchStock());
        setOrderName(null);
      })
      .catch(console.error);
  };

  const total = useMemo(() => {
    if (!cart?.items?.length) return 0;
    return cart.items.reduce((acc: any, item: any) => {
      const base = (item.variant?.price || 0) * item.quantity;
      const addonTotal =
        item.addons?.reduce(
          (sum: any, a: any) =>
            sum + (a.price || a.addon.price) * a.quantity,
          0
        ) ?? 0;
      return acc + base + addonTotal;
    }, 0);
  }, [cart]);

  if (loading) return <p className="p-6">Loading menu…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="flex gap-6 p-6 h-[90vh]">
      {/* ---------------- MENU ---------------- */}
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold mb-4">Menu</h2>

          <div className="flex justify-between items-center mb-4 bg-white px-4 py-2 rounded-lg shadow border z-50">
            <div className="text-sm font-semibold">
              Paper Cups: <span className="text-blue-600">{paperCups}</span>
            </div>
            <div className="text-sm font-semibold ml-4">
              Plastic Cups: <span className="text-green-600">{plasticCups}</span>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
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
                    <Card className="cursor-pointer hover:shadow-xl transition transform hover:-translate-y-1 bg-white rounded-xl border border-gray-200">
                      <CardHeader>
                        <CardTitle className="truncate">{p.name}</CardTitle>
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

                  <DialogContent className="sm:max-w-3xl w-full p-0 overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 bg-muted flex items-center justify-center">
                        <img
                          src={p.image || "/placeholder.png"}
                          alt={p.name}
                          className="object-cover w-full h-48 sm:h-full rounded-l-xl"
                        />
                      </div>

                      <div className="sm:w-2/3 p-6 flex flex-col gap-4">
                        <DialogHeader>
                          <DialogTitle>{p.name}</DialogTitle>
                        </DialogHeader>

                        <RadioGroup
                          value={selectedVariant ?? ""}
                          onValueChange={setSelectedVariant}
                          className="flex flex-col gap-2"
                        >
                          {p.variants?.map((v: any) => (
                            <div key={v.id} className="flex items-center space-x-2">
                              <RadioGroupItem value={v.id} id={`v-${v.id}`} />
                              <Label htmlFor={`v-${v.id}`}>
                                {v.servingType} - ₱{v.price}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>

                        <div className="flex items-center gap-3 mt-2">
                          <Button
                            variant="outline"
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          >
                            -
                          </Button>
                          <span className="font-semibold text-lg">{quantity}</span>
                          <Button
                            variant="outline"
                            onClick={() => setQuantity((q) => q + 1)}
                          >
                            +
                          </Button>
                        </div>

                        {p.categoryId !==
                          "bfa1cc11-dbe0-4efb-aee9-a05b0629ef4d" && (
                          <ScrollArea className="h-40 border p-3 rounded-md mt-2">
                            {addonsLoading ? (
                              <p>Loading addons...</p>
                            ) : (
                              addons.map((a: Addon) => (
                                <div key={a.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    checked={
                                      !!selectedAddons.find((s) => s.addonId === a.id)
                                    }
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

                        <Button
                          className="mt-4 w-full"
                          disabled={!selectedVariant}
                          onClick={() => handleAddToCart(p)}
                        >
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

      {/* ---------------- CART ---------------- */}
      <div className="w-96 flex flex-col bg-white rounded-xl border border-gray-200 p-4 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Cart</h2>

        <ScrollArea className="flex-1">
          {cart?.items?.length ? (
            <div className="flex flex-col gap-3">
              {cart.items.map((item: any) => (
                <Card
                  key={item.id}
                  className="rounded-lg border border-gray-100 shadow-sm"
                >
                  <CardContent className="p-3 flex flex-col gap-1">
                    <p className="font-semibold">
                      {item.variant?.product?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {item.variant?.servingType} | Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-medium">
                      ₱{item.variant?.price}
                    </p>

                    {item.addons?.length > 0 && (
                      <ul className="pl-4 text-sm text-muted-foreground">
                        {item.addons.map((a: any) => (
                          <li key={`${item.id}-${a.addonId}`}>
                            {a.addon?.name} - ₱
                            {(a.price || a.addon.price) * a.quantity}
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-1 self-end"
                      onClick={() => handleRemoveFromCart(item.id)}
                    >
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}

              <div className="mt-3 font-bold text-lg text-right">
                Total: ₱{total.toFixed(2)}
              </div>

              {/* Nickname */}
              <div className="mt-3">
                <Label>Nickname (for cup/order)</Label>
                <Input
                  placeholder="ex. Juan, Boss, Sir Blue"
                  value={orderName ?? ""}
                  onChange={(e) => setOrderName(e.target.value)}
                />
              </div>

              {/* Payment Method */}
              <div className="mt-3">
                <Label>Payment Method</Label>
                <Select value={paymentType} onValueChange={setPaymentType}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="GCASH">GCash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pickup Day / Time */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <Label>Pickup Day</Label>
                  <Select value={pickUpDay ?? ""} onValueChange={setPickUpDay}>
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

                <div>
                  <Label>Pickup Time</Label>
                  <Select value={pickUpTime ?? ""} onValueChange={setPickUpTime}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select time" />
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

                        if (selectedDayOffset === 0)
                          slots.push(
                            <SelectItem value="ASAP" key={"ASAP"}>
                              ASAP
                            </SelectItem>
                          );

                        for (let hour = STORE_OPEN; hour < STORE_CLOSE; hour++) {
                          for (let minute of [0, 15, 30, 45]) {
                            const slot = new Date(baseDate);
                            slot.setHours(hour);
                            slot.setMinutes(minute);

                            if (selectedDayOffset === 0 && slot <= now) continue;

                            const nearest = new Date(now);
                            nearest.setMinutes(
                              Math.ceil(now.getMinutes() / 15) * 15
                            );
                            nearest.setSeconds(0);
                            nearest.setMilliseconds(0);

                            if (
                              selectedDayOffset === 0 &&
                              slot.getTime() === nearest.getTime()
                            )
                              continue;

                            const label = slot.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            });

                            slots.push(
                              <SelectItem
                                value={label}
                                key={`${selectedDayOffset}-${label}`}
                              >
                                {label}
                              </SelectItem>
                            );
                          }
                        }

                        return slots;
                      })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Checkout */}
              <Button
                className="mt-4 w-full"
                onClick={handleCheckout}
                disabled={checkoutLoading || !cart?.items?.length}
              >
                {checkoutLoading ? "Processing..." : "Checkout"}
              </Button>

              {checkoutError && (
                <p className="text-red-500 mt-2">{checkoutError}</p>
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
