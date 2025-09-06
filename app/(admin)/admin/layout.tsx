import { Sidebar } from "@/components/layout/admin/Sidebar";

// app/admin/layout.tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-4">{children}</div>
    </main>
  );
}
