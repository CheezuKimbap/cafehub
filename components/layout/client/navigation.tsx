"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBasket, User } from "lucide-react";
import { useAppSelector } from "@/redux/hook";

interface NavItem {
  label: string;
  href?: string;
  type?: "link" | "cart" | "profile";
}

const navItemsHome: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Sign In", href: "/signin" },
];

const navItemsOther: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/about" },
  { label: "Cart", type: "cart" },
  { label: "Profile", type: "profile" },
];

function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const cart = useAppSelector((state) => state.cart.cart);
  const cartCount = cart?.items?.length ?? 0;

  const isHome = pathname === "/";
  const navItems = isHome ? navItemsHome : navItemsOther;

  const NAV_HIDDEN_PATHS = ["/signin", "/signup", "/forgot-password"];
  const shouldHideNav = NAV_HIDDEN_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // Hooks always run
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {!shouldHideNav && (
        <nav className="w-full">
          <div
            className={`flex items-center justify-between px-8 py-2 ${
              isHome ? "p-4 w-full" : "bg-white rounded-3xl m-2"
            }`}
          >
            {/* Logo */}
            <Link
              href="/"
              className={`font-bold uppercase text-xl flex items-center ${
                isHome ? "px-8" : ""
              }`}
            >
              <span className="text-3xl">C</span>offeesentials
            </Link>

            <div className="flex items-center space-x-4 ml-4">
              {/* Main nav links */}
              <div className="hidden md:flex items-center space-x-8 font-semibold">
                {navItems
                  .filter((item) => !["cart", "profile"].includes(item.type!))
                  .map((item, idx) => {
                    // If we're on home and the item is "Sign In"
                    if (isHome && item.label === "Sign In") {
                      return session ? (
                        <span key="profile" className="px-2 py-1 font-medium">
                          {session.user?.name}
                        </span>
                      ) : (
                        <Link
                          key={item.href}
                          href={item.href!}
                          className="bg-[#1C1306] px-4 py-1 rounded-xl text-white"
                        >
                          Sign In
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href!}
                        className={`hover:text-blue-600 transition-colors px-2 py-1 ${
                          pathname === item.href
                            ? "border-b-2 border-[#1C1306]"
                            : ""
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
              </div>

              {/* Cart and Profile */}
              <div className="flex items-center space-x-2">
                {navItems
                  .filter((item) => ["cart", "profile"].includes(item.type!))
                  .map((item) => {
                    if (item.type === "cart") {
                      return (
                        <Link key="cart" href="/cart">
                          <div className="relative">
                            <button className="flex items-center justify-center rounded-2xl p-2 bg-[#FF9500] hover:bg-orange-500 transition-colors">
                              <ShoppingBasket className="w-6 h-6 fill-black" />
                            </button>
                            {cartCount > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                {cartCount}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    }

                    if (item.type === "profile") {
                      return (
                        <div
                          key="profile"
                          className="relative inline-block"
                          ref={profileRef}
                        >
                          <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center justify-center rounded-2xl p-2 bg-gray-200 hover:bg-gray-300 transition-colors"
                          >
                            <User className="w-6 h-6" />
                          </button>
                          {profileOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 p-4">
                              {session ? (
                                <>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-6 h-6" />
                                    <span className="font-semibold">
                                      {session.user?.name}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => router.push("/order")}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    Orders
                                  </button>
                                  <button
                                    onClick={() => signOut()}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    Sign out
                                  </button>
                                </>
                              ) : (
                                <Link
                                  href="/signin"
                                  className="block px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                                  onClick={() => setProfileOpen(false)}
                                >
                                  Login
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    return null;
                  })}
              </div>
            </div>
          </div>
        </nav>
      )}
    </>
  );
}

export default Navigation;
