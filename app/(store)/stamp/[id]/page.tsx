"use client";

import { useEffect } from "react";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchCustomerById,
  selectSingleCustomer,
  selectCustomerStatus,
} from "@/redux/features/customer/customerSlice";
import { fetchAllTiers } from "@/redux/features/loyaltyTiers/loyaltyTiersSlice";
import Stamp from "@/public/store/Stamp.svg";
import { useParams } from "next/navigation";

export default function StampRoute() {
  const params = useParams();
  const customerId = Array.isArray(params.id) ? params.id[0] : params.id;

  const dispatch = useAppDispatch();
  const customer = useAppSelector(selectSingleCustomer);
  const status = useAppSelector(selectCustomerStatus);
  const rewardTiers = useAppSelector((state) => state.loyaltyTiers.list);

  // Fetch customer and loyalty tiers on mount
  useEffect(() => {
    if (customerId) dispatch(fetchCustomerById(customerId));
    dispatch(fetchAllTiers());
  }, [customerId, dispatch]);

  if (status === "loading") return <p>Loading...</p>;
  if (status === "failed") return <p>Failed to fetch customer</p>;
  if (!customer) return <p>No customer found</p>;

  // Determine max stamps dynamically from reward tiers
  const MAX_STAMPS =
    rewardTiers.length > 0
      ? Math.max(...rewardTiers.map((t) => t.stampNumber))
      : 12;

  const stamps = Math.min(customer?.currentStamps ?? 0, MAX_STAMPS);
  const stampSlots = Array.from({ length: MAX_STAMPS }).map((_, i) => i + 1);

  // Make a copy of rewardTiers before sorting to avoid mutating Redux state
  const sortedTiers = [...rewardTiers].sort((a, b) => a.stampNumber - b.stampNumber);

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 md:mt-20 bg-white rounded-2xl shadow-lg p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">Coffeessential Stamp</h1>
          <p className="text-sm text-muted-foreground mt-1 md:mt-0">
            Collect stamps to earn rewards
          </p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <div className="text-xs text-slate-500">Progress</div>
          <div className="text-lg font-medium">
            {stamps} / {MAX_STAMPS}
          </div>
        </div>
      </header>

      {/* Stamps grid */}
      <section className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-4 mb-6">
        {stampSlots.map((slot) => (
          <div
            key={slot}
            className="relative flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 border rounded-xl bg-gray-50"
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

      {/* Reward milestones */}
      {sortedTiers.length > 0 && (
        <section className="flex flex-wrap gap-2 md:gap-4">
          {sortedTiers.map((tier) => (
            <div
              key={tier.id}
              className={`px-3 py-1 rounded-lg border text-sm ${
                customer.currentStamps! >= tier.stampNumber
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-gray-100 border-gray-300 text-gray-600"
              }`}
            >
              {tier.stampNumber} → {tier.rewardDescription || tier.rewardType}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
