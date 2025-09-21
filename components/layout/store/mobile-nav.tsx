"use client";

import { Home, Activity, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  const links = [
    { href: "/menu", label: "Menu", icon: Home },
    { href: "/order", label: "Activity", icon: Activity },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: 2 }, // Example badge
    { href: "/my-account", label: "Account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md md:hidden">
      <ul className="flex justify-around items-center py-2">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;

          return (
            <li key={href} className="relative">
              <Link
                href={href}
                className={`flex flex-col items-center transition-colors ${
                  isActive
                    ? "text-orange-600 font-semibold"
                    : "text-gray-600 hover:text-orange-600"
                }`}
              >
                <Icon size={22} />
                <span className="text-xs">{label}</span>

                {/* Badge */}
                {badge && (
                  <span className="absolute top-0 right-3 bg-brown-600 text-white text-[10px] px-1 rounded-full">
                    {badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
