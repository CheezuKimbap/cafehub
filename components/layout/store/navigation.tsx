"use client";
import {
  ShoppingBasket,
  User,
  ShoppingBag,
  Star,
  LogOut,
  LogIn,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { resetStore } from "@/redux/store";

function CustomerNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const cart = useAppSelector((state) => state.cart.cart);
  const cartCount = cart?.items?.length ?? 0;

  const NAV_HIDDEN_PATHS = ["/register", "/login", "/forgot-password", "/404"];
  const shouldHideNav =
    NAV_HIDDEN_PATHS.some((path) => pathname.startsWith(path)) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/barista");

  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (cartCount === 0) return;
    setBump(true);
    const timer = setTimeout(() => setBump(false), 300);
    return () => clearTimeout(timer);
  }, [cartCount]);

  // Close profile dropdown when clicking outside
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

  if (shouldHideNav) return null;

  return (
    <nav className="hidden md:block w-full bg-white shadow-sm">
      <div className=" mx-auto flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold uppercase text-2xl flex items-center"
        >
          <span className="text-4xl">C</span>offeesentials
        </Link>

        <div className="flex items-center gap-4">
          {/* Main nav links */}
          <div className="flex  space-x-8 font-semibold">
            <Link
              href="/"
              className={`hover:text-orange-600 transition-colors ${
                pathname === "/"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`hover:text-orange-600 transition-colors ${
                pathname === "/menu"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : ""
              }`}
            >
              Menu
            </Link>
            <Link
              href="/about"
              className={`hover:text-orange-600 transition-colors ${
                pathname === "/about"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : ""
              }`}
            >
              About
            </Link>
          </div>

          {/* Cart + Profile */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link href="/cart" className="relative" id="cart-icon">
              <button
                className={`flex items-center justify-center rounded-lg p-2 bg-orange-500 hover:bg-orange-600 transition-all ${
                  bump ? "scale-110" : "scale-100"
                }`}
              >
                <ShoppingBasket className="w-6 h-6 text-white" />
              </button>

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center rounded-lg p-2 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="w-6 h-6" />
              </button>
              {profileOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg z-50 p-4">
                  {session ? (
                    <>
                      <div className="mb-3 font-semibold text-gray-700">
                        Hi, {session?.user?.name ?? "Guest"}
                      </div>
                      <button
                        onClick={() =>
                          router.push(`/profile/${session.user.customerId}`)
                        }
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        My Profile
                      </button>
                      <button
                        onClick={() => router.push("/order")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        My Orders
                      </button>
                      <button
                        onClick={() =>
                          router.push(`/stamp/${session.user.customerId}`)
                        }
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                      >
                        My Stamps
                      </button>
                      <button
                        onClick={async () => {
                          resetStore();
                          await signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg text-red-600"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg"
                    >
                      <LogIn className="w-5 h-5 inline-block mr-2 text-gray-500" />
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default CustomerNavigation;
