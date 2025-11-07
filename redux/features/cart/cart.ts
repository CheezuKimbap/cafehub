// src/redux/features/cart/cart.ts
import { ProductVariant } from "../products/product";

export interface CartItemAddon {
  addonId: string;
  quantity: number;
  price: number; // stored locked price
  addon: {
    name: string;
    price: number;
  };
}

export interface CartItem {
  id: string;
  quantity: number;
  price: number; // computed or stored
  variantId: string;

  variant: ProductVariant & {
    product: {
      id: string;
      name: string;
      image?: string | null;
      price: number;
    };
  };

  addons: CartItemAddon[];
}

export interface Cart {
  id: string;
  customerId: string;
  items: CartItem[];
  status: "ACTIVE" | "CHECKED_OUT" | "ABANDONED";
}

export interface CartState {
  cart: Cart | null;
  status: "idle" | "loading" | "failed";
}
