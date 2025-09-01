import Navigation from "@/components/layout/client/menu/navigation";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`min-h-screen bg-[var(--color-cf-background)] p-4`}>
      <Navigation />
      {children}
    </div>
  );
}
