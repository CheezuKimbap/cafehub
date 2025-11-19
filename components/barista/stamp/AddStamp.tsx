"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { selectCustomers, fetchCustomerById } from "@/redux/features/customer/customerSlice";
import { addStamp } from "@/redux/features/stamp/stampSlice";
import { fetchAllTiers, LoyaltyRewardTier } from "@/redux/features/loyaltyTiers/loyaltyTiersSlice";
import Stamp from "@/public/store/Stamp.svg";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StampDialogProps {
  customerId: string;
}

export const StampDialog: React.FC<StampDialogProps> = ({ customerId }) => {
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectCustomers);
  const customer = customers.find((c) => c.id === customerId);

  // Loyalty reward tiers
  const rewardTiers: LoyaltyRewardTier[] = useAppSelector((state) => state.loyaltyTiers.list);

  // Determine max stamps dynamically from tiers
  const MAX_STAMPS = rewardTiers.length > 0
    ? Math.max(...rewardTiers.map((t) => t.stampNumber))
    : 12;

  const [stamps, setStamps] = useState(customer?.currentStamps ?? 0);

  // Sync local state when Redux updates
  useEffect(() => {
    if (customer) setStamps(customer.currentStamps ?? 0);
  }, [customer?.currentStamps]);

  // Fetch customer and tiers on mount
  useEffect(() => {
    if (customerId) dispatch(fetchCustomerById(customerId));
    dispatch(fetchAllTiers());
  }, [customerId, dispatch]);

  if (!customer) return null;

  const stampSlots = Array.from({ length: MAX_STAMPS }, (_, i) => i + 1);

  const handleStampClick = async (slot: number) => {
    setStamps((prev) => {
      if (slot <= prev) return prev; // already filled
      return prev + (slot - prev);
    });

    const stampsToAdd = slot - stamps;

    try {
      await dispatch(addStamp({ id: customerId, stamps: stampsToAdd })).unwrap();
    } catch (err) {
      console.error(err);
      alert("Failed to add stamp");
      // rollback safely using functional update
      setStamps((prev) => prev - stampsToAdd);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">View / Add Stamps</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customer Stamps</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Click a stamp to add it for the customer
          </p>
        </DialogHeader>

        {/* Stamps grid */}
        <section className="grid grid-cols-3 sm:grid-cols-6 gap-4 my-4">
          {stampSlots.map((slot) => (
            <div
              key={slot}
              onClick={() => handleStampClick(slot)}
              className={`relative flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border rounded-xl cursor-pointer transition-colors ${
                slot <= stamps ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Image src={Stamp} alt="Stamp Slot" width={32} height={32} />
              {slot <= stamps && (
                <CircleCheck
                  className="absolute w-8 sm:w-10 h-8 sm:h-10 text-[#57C262]"
                  strokeWidth={2.5}
                />
              )}
            </div>
          ))}
        </section>

        {/* Optional: show reward milestones */}
        {rewardTiers.length > 0 && (
          <section className="flex flex-wrap gap-2 md:gap-4">
            {[...rewardTiers].sort((a, b) => a.stampNumber - b.stampNumber).map((tier) => (
              <div
                key={tier.id}
                className={`px-3 py-1 rounded-lg border text-sm ${
                  stamps >= tier.stampNumber
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-gray-100 border-gray-300 text-gray-600"
                }`}
              >
                {tier.stampNumber} → {tier.rewardDescription || tier.rewardType}
              </div>
            ))}
          </section>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
