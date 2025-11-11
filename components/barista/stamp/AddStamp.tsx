"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  selectCustomers,
  fetchCustomerById,
} from "@/redux/features/customer/customerSlice";
import { addStamp } from "@/redux/features/stamp/stampSlice";
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
  const MAX_STAMPS = 12;
  const dispatch = useAppDispatch();
  const customers = useAppSelector(selectCustomers);
  const customer = customers.find((c) => c.id === customerId);

  // Local state for stamps (optimistic updates)
  const [stamps, setStamps] = useState(customer?.currentStamps ?? 0);

  // Sync with Redux if backend changes
  useEffect(() => {
    if (customer) setStamps(customer.currentStamps ?? 0);
  }, [customer?.currentStamps]);

  // Fetch customer when dialog opens
  useEffect(() => {
    if (customerId) dispatch(fetchCustomerById(customerId));
  }, [customerId, dispatch]);

  if (!customer) return null;

  const stampSlots = Array.from({ length: MAX_STAMPS }).map((_, i) => i + 1);

  const handleStampClick = async (slot: number) => {
    if (slot <= stamps) return; // already filled

    const stampsToAdd = slot - stamps;

    // Optimistically update local stamps immediately
    setStamps(stamps + stampsToAdd);

    try {
      await dispatch(
        addStamp({ id: customerId, stamps: stampsToAdd }),
      ).unwrap();
      // Redux state will sync automatically if needed
    } catch (err) {
      console.error(err);
      alert("Failed to add stamp");
      // Rollback if API fails
      setStamps(stamps);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          View / Add Stamps
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customer Stamps</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Click a stamp to add it for the customer
          </p>
        </DialogHeader>

        {/* Stamps grid */}
        <section className="grid grid-cols-6 gap-6 my-4">
          {stampSlots.map((slot) => (
            <div
              key={slot}
              onClick={() => handleStampClick(slot)}
              className={`relative flex gap-4 items-center justify-center w-16 h-16 border rounded-xl cursor-pointer transition-colors ${
                slot <= stamps ? "bg-green-50" : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Image src={Stamp} alt="Stamp Slot" width={40} height={40} className="" />
              {slot <= stamps && (
                <CircleCheck
                  className="absolute w-10 h-10 text-[#57C262]"
                  strokeWidth={2.5}
                />
              )}
            </div>
          ))}
        </section>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
