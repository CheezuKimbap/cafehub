import { AddProductButton } from "@/components/admin/inventory/AddProduct";
import { InventorySummary } from "@/components/admin/inventory/InventorySummary";
import InventoryTable from "@/components/admin/inventory/InventoryTable";

export default function InventoryPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Inventory</h1>

      <InventorySummary />
      <InventoryTable />
    </div>
  );
}
