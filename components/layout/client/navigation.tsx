"use client";
import { useSession } from "next-auth/react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <nav className="w-full flex items-center justify-between p-4">
      <div>
        <Link href="/">
          <p className="font-bold uppercase text-xl px-8">
            <span className="text-3xl">C</span>offeesentials
          </p>
        </Link>
      </div>

      <div className="font-semibold text-normal px-8 hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList className="space-x-8">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link
                  href={item.href}
                  className={`px-2 py-1 ${
                    pathname === item.href
                      ? "border-b-2 border-[#1C1306]" // underline active
                      : "hover:border-b-2 hover:border-gray-400"
                  }`}
                >
                  {item.label}
                </Link>
              </NavigationMenuItem>
            ))}

            {!session ? (
              <NavigationMenuItem>
                <Link
                  href="/signin"
                  className="bg-[#1C1306] px-4 py-1 rounded-xl text-white"
                >
                  Sign In
                </Link>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem className="px-4 py-1 rounded-xl font-medium">
                {session.user?.name}
              </NavigationMenuItem>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default Navigation;
