import { Sidebar, NavItem } from "@/components/layout/admin/Sidebar";

// app/admin/layout.tsx
export default function BaristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baristaNav: NavItem[] = [
    { label: "Dashboard", href: "/barista/dashboard", icon: "home" },
    { label: "Orders", href: "/barista/orders", icon: "package" },
    { label: "Menu", href: "/barista/menu", icon: "menu" },
    {
      label: "Settings",
      href: "/admin/settings",
      icon: "settings",
      position: "bottom",
    },
  ];

  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar items={baristaNav} title="Barista Panel" />
      <div className="flex-1 p-4">{children}</div>
    </main>
  );
}
