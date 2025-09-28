"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

const navItemsHome = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
];

function Navigation() {
  const { data: session } = useSession();

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between px-8 py-4 w-full">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold uppercase text-xl flex items-center px-8"
        >
          <span className="text-3xl">C</span>offeesentials
        </Link>

        {/* Main links */}
        <div className="hidden md:flex items-center space-x-8 font-semibold">
          {navItemsHome.map((item) => {
            if (item.label === "Login") {
              return session ? (
                <span key="profile" className="px-2 py-1 font-medium">
                  Hi, {session.user?.name}
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
                className="hover:text-blue-600 transition-colors px-2 py-1"
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
