import Navigation from "@/components/layout/client/menu/navigation";

export default function CartLayout({
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
