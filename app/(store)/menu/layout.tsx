// app/menu/layout.tsx

import CustomerNavigation from "@/components/layout/store/navigation";
import MobileNav from "@/components/layout/store/mobile-nav";
import Link from "next/link";
import React from "react";
import { DynamicBreadcrumb } from "@/components/common/DynamicBreadcrumb";
import { Toaster } from "@/components/ui/sonner";

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">

      {/* Mobile logo only */}
      <nav className="block md:hidden">
        <Link
          href="/"
          className="font-bold uppercase text-xl flex items-center px-4 my-2"
        >
          <span className="text-3xl">C</span>offeesentials
        </Link>
      </nav>

      {/* Tablet-only customer nav */}
      <div className="hidden md:block lg:block">
        <CustomerNavigation />
      </div>

      {/* Main content */}
      <main className="flex-1 px-4">
        <DynamicBreadcrumb />
        {children}
      </main>

      {/* Mobile-only nav */}
      <div className="block md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}
