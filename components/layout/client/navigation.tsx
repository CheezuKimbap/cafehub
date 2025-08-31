import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import React from "react";

function Navigation() {
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
            <NavigationMenuItem className="bg-[#1C1306] px-4 py-1 rounded-xl text-white">
              Sign In
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </nav>
  );
}

export default Navigation;
