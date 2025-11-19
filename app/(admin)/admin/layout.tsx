import { Sidebar, NavItem } from "@/components/layout/admin/Sidebar";

// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminNav: NavItem[] = [
    { label: "Dashboard", href: "/admin/dashboard", icon: "home" },
    { label: "Inventory", href: "/admin/inventory", icon: "package" },
    { label: "Customer", href: "/admin/customer", icon: "user" },
    { label: "Stamp", href: "/admin/stamp", icon: "stamp" },

  ];

  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar items={adminNav} title="Admin Panel" />
      <div className="flex-1 p-4">{children}</div>
    </main>
  );
}
