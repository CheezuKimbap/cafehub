"use client";

import { Manrope, Sora } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Package, User, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { resetStore } from "@/redux/store";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <Home size={20} /> },
  { label: "Inventory", href: "/admin/inventory", icon: <Package size={20} /> },
  { label: "Customer", href: "/admin/customer", icon: <User size={20} /> },
];

const bottomNavItems = [
  { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-white border-r-2 flex flex-col justify-between">
      {/* Top Section */}
      <div>
        <h1
          className={`${sora.className} font-extrabold text-2xl text-[#787878] p-4`}
        >
          Coffeessentials
        </h1>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                  isActive
                    ? "bg-orange-500 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {item.icon}
                <span className={manrope.className}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <nav className="flex flex-col gap-2 p-4 mb-4">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium ${
                isActive
                  ? "bg-orange-500 text-white"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {item.icon}
              <span className={manrope.className}>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={async () => {
            resetStore();
            await signOut({ callbackUrl: "/admin/login" });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md font-medium hover:bg-gray-100 text-gray-700"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
}
