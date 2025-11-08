import { Customer, ServingType } from "@/prisma/generated/prisma";
import { Product } from "@/prisma/generated/prisma";

// Order & Payment status enums
export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "COMPLETED"
  | "READYTOPICKUP"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

// Addon interface
export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonId: string;
  quantity: number;
  addon: {
    id: string;
    name: string;
    price: number;
  };
}

// Order item now uses variant instead of product directly
export interface OrderItem {
  id: string;
  variantId: string; // updated for variant usage
  quantity: number;
  servingType: ServingType;
  priceAtPurchase: number;
  variant: {
    id: string;
    price: number;
    servingType: ServingType;
    product: Product; // product info inside variant
  };
  addons: OrderItemAddon[];
}

// Main order interface
export interface Order {
  id: string;
  customerId: string;
  orderDate: string; // ISO date string
  totalAmount: number;
  discountApplied?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderItems: OrderItem[];
  customer: Customer;
  paymentMethod?: {
    type: string; // e.g., "CASH" | "GCASH"
    provider?: string; // optional provider info
    details?: string; // optional payment details
    status: PaymentStatus;
    paidAt?: string; // ISO date if paid
  };
}
