// app/barista/layout.tsx
"use client";

import { Sidebar, NavItem } from "@/components/layout/admin/Sidebar";
import { OrderNotifications } from "./OrderNotifications";

export default function BaristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baristaNav: NavItem[] = [
    { label: "Orders", href: "/barista/orders", icon: "package" },
    { label: "Barista Panel", href: "/barista/barista-panel", icon: "menu" },
    { label: "Stamps", href: "/barista/stamps", icon: "stamp" },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: "settings",
      position: "bottom",
    },
  ];

  // 🔓 unlock audio once
  const unlockAudio = () => {
    window.dispatchEvent(new Event("audio-unlock"));
  };

  return (
    <main
      className="flex min-h-screen bg-gray-100"
      onClick={unlockAudio}
    >
      <Sidebar items={baristaNav} title="Barista Panel" />

      <div className="flex flex-col flex-1">
        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <h1 className="font-semibold text-gray-800">Orders</h1>
          <OrderNotifications />
        </header>

        <div className="flex-1 p-4 overflow-auto">{children}</div>
      </div>
    </main>
  );
}
