"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Search, ShoppingBasket, User } from "lucide-react";

function Navigation() {
  const { data: session } = useSession();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchValue, setSearchValue] = useState("");
  const navItems = [
    { label: "Home", href: "/" },
    { label: "Menu", href: "/menu" },
    { label: "About", href: "/about" },
  ];

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full">
      <div className="flex bg-white items-center justify-between rounded-3xl px-8 py-2">
        {/* Logo */}
        <div>
          <p className="font-bold uppercase text-xl">
            <span className="text-3xl">C</span>offeesentials
          </p>
        </div>

        {/* Desktop Menu */}

        {/* Right icons */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-8 font-semibold">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
          {/* Search Input */}
          <div className="relative flex-1 max-w-md ml-6">
            <input
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Shopping Basket */}
          <Link href={"/cart"}>
            <button className="flex items-center justify-center rounded-2xl p-2 bg-[#FF9500] hover:bg-orange-500 transition-colors">
              <ShoppingBasket className="w-6 h-6 fill-black" />
            </button>{" "}
          </Link>

          {/* Profile button + popup wrapper */}
          <div className="relative inline-block">
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
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
