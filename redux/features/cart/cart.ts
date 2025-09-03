import { Product } from "./../products/product";

export interface CartItem {
  id: string;
  quantity: number;
  price: number; // price at the time of adding
  product: Product;
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