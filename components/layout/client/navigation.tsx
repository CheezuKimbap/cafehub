import { auth } from "@/auth";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";
import { redirect, useRouter } from "next/navigation";
import React from "react";

async function Navigation() {
  const session = await auth();
  return (
    <nav className="w-full flex items-center justify-between p-4">
      <div>
        <p className="font-bold uppercase text-xl px-8">
          <span className="text-3xl">C</span>offeesentials
        </p>
      </div>

      <div className="font-semibold text-normal px-8 hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList className="space-x-8">
            <NavigationMenuItem>Home</NavigationMenuItem>
            <NavigationMenuItem>About</NavigationMenuItem>
            <NavigationMenuItem>Contact</NavigationMenuItem>
            {!session ? (
              <NavigationMenuItem className="bg-[#1C1306] px-4 py-1 rounded-xl text-white">
                <Link
                  href="/signin"
                  className="bg-[#1C1306] px-4 py-1 rounded-xl text-white"
                >
                  Sign In
                </Link>
              </NavigationMenuItem>
            ) : (
              <NavigationMenuItem className="px-4 py-1 rounded-xl font-medium ">
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
