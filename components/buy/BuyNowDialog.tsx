"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BuyNowForm } from "@/components/buy/BuyNowForm";

export function BuyNowDialog({ open, onClose, product, quantity, selectedAddons, variantId }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Buy Now – {product.name}</DialogTitle>
        </DialogHeader>

        <BuyNowForm
          product={product}
          quantity={quantity}
          selectedAddons={selectedAddons}
          variantId={variantId}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
