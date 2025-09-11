"use client";

import { use } from "react";
import { useEffect } from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCustomerById,
  selectSingleCustomer,
  selectCustomerStatus,
} from "@/redux/features/customer/customerSlice";
import Stamp from "@/public/store/Stamp.svg";
import { useParams } from "next/navigation";

export default function StampRoute() {
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const MAX_STAMPS = 10;

  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectSingleCustomer);
  const status = useAppSelector(selectCustomerStatus);

  // fetch customer when page loads
  useEffect(() => {
    if (customerId) {
      dispatch(fetchCustomerById(customerId));
    }
  }, [customerId, dispatch]);

  const stamps = Math.min(customer?.currentStamps ?? 0, MAX_STAMPS);
  const stampSlots = Array.from({ length: MAX_STAMPS }).map((_, i) => i + 1);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Failed to fetch customer</p>;
  if (!customer) return <p>No customer found</p>;

  return (
    <div className="w-full max-w-3xl mx-auto mt-20 bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Loyalty Bean Card</h1>
          <p className="text-sm text-muted-foreground">
            Collect 10 beans to get a free drink
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500">Progress</div>
          <div className="text-lg font-medium">
            {stamps} / {MAX_STAMPS}
          </div>
        </div>
      </header>

      {/* Stamps grid */}
      <section className="grid grid-cols-5 gap-4 mb-6">
        {stampSlots.map((slot) => (
          <div
            key={slot}
            className="relative flex items-center justify-center w-16 h-16 border rounded-xl bg-gray-50"
          >
            <Image src={Stamp} alt="Stamp Slot" width={40} height={40} />

            {slot <= stamps && (
              <CircleCheck
                className="absolute w-10 h-10 text-[#57C262]"
                strokeWidth={2.5}
              />
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
