"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchStock, updateStock } from "@/redux/features/stock/stocksSlice";
import { toast } from "sonner";

export function EditCupsButton() {
  const dispatch = useAppDispatch();
  const stock = useAppSelector((state) => state.stock.stock);
  const [open, setOpen] = useState(false);

  const [paperCupCount, setPaperCupCount] = useState(0);
  const [plasticCupCount, setPlasticCupCount] = useState(0);

  // Load stock on open
  useEffect(() => {
    if (open) {
      dispatch(fetchStock());
    }
  }, [open, dispatch]);

  // Update local form values when stock loads
  useEffect(() => {
    if (stock) {
      setPaperCupCount(stock.paperCupCount);
      setPlasticCupCount(stock.plasticCupCount);
    }
  }, [stock]);

  const handleSave = async () => {
    toast.info("Updating cup stock...");
    await dispatch(updateStock({ paperCupCount, plasticCupCount }));
    toast.success("Stock updated successfully!");

    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Add Cups
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Cup Inventory</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Paper Cups</label>
              <Input
                type="number"
                value={paperCupCount}
                onChange={(e) => setPaperCupCount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Plastic Cups</label>
              <Input
                type="number"
                value={plasticCupCount}
                onChange={(e) => setPlasticCupCount(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
