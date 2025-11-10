"use client";

import { Manrope, Sora } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  Home,
  Package,
  Settings,
  User,
  Menu,
  Stamp,
} from "lucide-react";
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

// map string → lucide icon
const icons = {
  home: Home,
  package: Package,
  user: User,
  settings: Settings,
  menu: Menu,
  stamp: Stamp,
};

export interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof icons; // string key
  position?: "top" | "bottom"; // default top
}

type SidebarProps = {
  items: NavItem[];
  title?: string;
  showLogout?: boolean;
};

export function Sidebar({
  items,
  title = "Coffeessentials",
  showLogout = true,
}: SidebarProps) {
  const pathname = usePathname();

  const topNav = items.filter((i) => !i.position || i.position === "top");
  const bottomNav = items.filter((i) => i.position === "bottom");

  return (
    <aside className="w-64 h-screen bg-white border-r-2 flex flex-col justify-between sticky top-0">
      {/* Top Section */}
      <div>
        <h1
          className={`${sora.className} font-extrabold text-2xl text-[#787878] p-4`}
        >
          {title}
        </h1>

        <nav className="flex flex-col gap-2 p-4">
          {topNav.map((item) => {
            const Icon = icons[item.icon];
            const isActive = pathname.startsWith(item.href);

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
                <Icon size={20} />
                <span className={manrope.className}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <nav className="flex flex-col gap-2 p-4 mb-4">
        {bottomNav.map((item) => {
          const Icon = icons[item.icon];
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
              <Icon size={20} />
              <span className={manrope.className}>{item.label}</span>
            </Link>
          );
        })}

        {showLogout && (
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
        )}
      </nav>
    </aside>
  );
}
