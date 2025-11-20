"use client";

import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { buyProduct } from "@/redux/features/buyout/buyoutSlice";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const STORE_OPEN = 9;
const STORE_CLOSE = 22;
const dayOptions = [
  { label: "Today", offset: 0 },
  { label: "Tomorrow", offset: 1 },
  { label: "Day After Tomorrow", offset: 2 },
];

export function BuyNowForm({ product, quantity, selectedAddons, variantId, onCancel, customerId }: any) {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.buyout);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [pickUpDay, setPickUpDay] = useState<string>("0");
  const [pickUpTime, setPickUpTime] = useState<string | null>("ASAP");

  const total =
    (product.price + selectedAddons.reduce((acc: any, a: any) => acc + a.price, 0)) *
    quantity;

  // Reset time if today is selected
  useEffect(() => {
    if (Number(pickUpDay) === 0) setPickUpTime("ASAP");
    else setPickUpTime(null);
  }, [pickUpDay]);

  const handleBuyNow = async () => {
    if (!customerId) return alert("Please log in to buy.");

    // Compute pickup timestamp
    const now = new Date();
    const pickupDate = new Date();
    pickupDate.setDate(now.getDate() + Number(pickUpDay));
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

    try {
      await dispatch(
        buyProduct({
          customerId,
          variantId,
          quantity,
          addons: selectedAddons.map((a: any) => ({ addonId: a.id, quantity: a.quantity })),
          paymentType: paymentMethod,
          paymentProvider: paymentMethod,
          pickupTime: pickupDate.toISOString(), // ✅ include computed pickup time
        })
      ).unwrap();
      onCancel();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <p className="font-semibold">{product.name}</p>
      <p>Total: ₱{total.toFixed(2)}</p>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-sm font-medium">Pickup Day</label>
          <Select value={pickUpDay} onValueChange={setPickUpDay}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {dayOptions.map((d) => (
                <SelectItem key={d.label} value={String(d.offset)}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium">Pickup Time</label>
          <Select value={pickUpTime ?? ""} onValueChange={setPickUpTime}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {(() => {
                const slots = [];
                const now = new Date();
                const baseDate = new Date();
                baseDate.setDate(baseDate.getDate() + Number(pickUpDay));
                baseDate.setSeconds(0);
                baseDate.setMilliseconds(0);

                if (Number(pickUpDay) === 0) slots.push(<SelectItem key="ASAP" value="ASAP">ASAP</SelectItem>);

                for (let hour = STORE_OPEN; hour < STORE_CLOSE; hour++) {
                  for (let minute of [0, 15, 30, 45]) {
                    const slot = new Date(baseDate);
                    slot.setHours(hour);
                    slot.setMinutes(minute);
                    if (Number(pickUpDay) === 0 && slot <= now) continue;
                    slots.push(
                      <SelectItem key={`${hour}-${minute}`} value={slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}>
                        {slot.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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

      <div>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="GCASH">GCash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleBuyNow}
          className="bg-green-600 text-white"
          disabled={loading}
        >
          {loading ? "Processing..." : `Confirm ₱${total.toFixed(2)}`}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
