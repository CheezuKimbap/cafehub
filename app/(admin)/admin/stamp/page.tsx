import { AddProductButton } from "@/components/admin/inventory/AddProduct";
import { InventorySummary } from "@/components/admin/inventory/InventorySummary";
import InventoryTable from "@/components/admin/inventory/InventoryTable";
import { RewardTiersTable } from "@/components/admin/stamp/RewardTiersTable";

export default function StampPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Loyalty Program</h1>
      <RewardTiersTable />
    </div>
  );
}
