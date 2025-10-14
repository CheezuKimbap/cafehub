import { Product } from "./../products/product";
import { ServingType } from "@/prisma/generated/prisma";
export interface CartItem {
  id: string;
  quantity: number;
  price: number;
  servingType: ServingType; // price at the time of adding
  product: Product;
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
export interface CartItemAddon {
  addonId: string;
  quantity: number;
  price: number; // optional, depends if you store price on cart item or addon
  addon: {
    name: string;
    price: number;
  };
}
