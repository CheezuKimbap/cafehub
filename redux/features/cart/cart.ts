import { Product, ProductVariant } from "../products/product";

export interface CartItem {
  id: string;
  quantity: number;
  price: number;

  variantId: string;
  variant: {
    id: string;
    price: number;
    servingType: string;
    size?: string | null;

    // ✅ include product inside variant
    product: {
      id: string;
      name: string;
      image?: string | null;
      price: number
    };
  };

  addons: CartItemAddon[];
}

export interface CartItemAddon {
  addonId: string;
  quantity: number;
  price: number; // locked price
  addon: {
    name: string;
    price: number;
  };
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
  price: number; // stored at add time
  addon: {
    name: string;
    price: number;
  };
}
