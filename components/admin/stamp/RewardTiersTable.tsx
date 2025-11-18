"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchAllTiers,
  addTier,
  updateTier,
  deleteTier,
  LoyaltyRewardTier,
} from "@/redux/features/loyaltyTiers/loyaltyTiersSlice";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RewardTiersTable() {
  const dispatch = useAppDispatch();
  const { list, loading } = useAppSelector((state) => state.loyaltyTiers);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTier, setEditingTier] = useState<LoyaltyRewardTier | null>(null);

  const [stampNumber, setStampNumber] = useState(1);
  const [rewardType, setRewardType] = useState<"FREE_ITEM" | "PERCENTAGE_OFF">("FREE_ITEM");
  const [rewardDescription, setRewardDescription] = useState("");
  const [discountAmount, setDiscountAmount] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchAllTiers());
  }, [dispatch]);

  const openAddDialog = () => {
    setEditingTier(null);
    setStampNumber(1);
    setRewardType("FREE_ITEM");
    setRewardDescription("");
    setDiscountAmount(null);
    setDialogOpen(true);
  };

  const openEditDialog = (tier: LoyaltyRewardTier) => {
    setEditingTier(tier);
    setStampNumber(tier.stampNumber);
    setRewardType(tier.rewardType);
    setRewardDescription(tier.rewardDescription || "");
    setDiscountAmount(tier.rewardType === "FREE_ITEM" ? null : tier.discountAmount || 0);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!stampNumber || !rewardDescription) {
      alert("Please fill in all required fields.");
      return;
    }

    // Duplicate stamp validation
    const duplicate = list.some(
      (tier) =>
        tier.stampNumber === stampNumber &&
        tier.id !== editingTier?.id
    );
    if (duplicate) {
      alert(`A tier with stamp number ${stampNumber} already exists.`);
      return;
    }

    const payload = {
      stampNumber,
      rewardType,
      rewardDescription,
      discountAmount: rewardType === "FREE_ITEM" ? null : discountAmount,
    };

    if (editingTier) {
      dispatch(updateTier({ id: editingTier.id, data: payload })).then(() => setDialogOpen(false));
    } else {
      dispatch(addTier(payload)).then(() => setDialogOpen(false));
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tier?")) {
      dispatch(deleteTier(id));
    }
  };

  const columns = [
    { header: "Stamp Number", accessorKey: "stampNumber" },
    { header: "Reward Type", accessorKey: "rewardType" },
    {
      header: "Reward Description",
      accessorKey: "rewardDescription",
      cell: ({ row }: any) => row.original.rewardDescription || "-"
    },
    {
      header: "Discount Amount",
      accessorKey: "discountAmount",
      cell: ({ row }: any) => row.original.discountAmount != null ? `${row.original.discountAmount}%` : "-"
    },
    {
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => openEditDialog(row.original)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-4 space-y-4">

      {loading ? (
        <p className="p-4">Loading tiers...</p>
      ) : (
        <DataTable columns={columns} data={list} actions={ <Button onClick={openAddDialog}>Add Tier</Button>
} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTier ? "Edit Tier" : "Add Tier"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <label className="block font-medium">Stamp Number</label>
            <Input
              type="number"
              value={stampNumber}
              onChange={(e) => setStampNumber(Number(e.target.value))}
              min={1}
            />

            <label className="block font-medium">Reward Type</label>
            <Select value={rewardType} onValueChange={(v) => setRewardType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE_ITEM">Free Item</SelectItem>
                <SelectItem value="PERCENTAGE_OFF">Discount</SelectItem>
              </SelectContent>
            </Select>

            <label className="block font-medium">Reward Description</label>
            <Input
              value={rewardDescription}
              onChange={(e) => setRewardDescription(e.target.value)}
              placeholder="Enter reward description"
            />

            {rewardType === "PERCENTAGE_OFF" && (
              <>
                <label className="block font-medium">Discount Amount (%)</label>
                <Input
                  type="number"
                  value={discountAmount || 0}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  min={0}
                />
              </>
            )}

            <Button onClick={handleSave} className="w-full">
              {editingTier ? "Save Changes" : "Add Tier"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
