import { ServingType } from "@/prisma/generated/prisma";

// Each item in an order
export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;        // Optional variant reference
  quantity: number;
  servingType: ServingType;
  priceAtPurchase: number;
  addons?: OrderItemAddon[]; // Optional addons
}

// Each addon attached to an order item
export interface OrderItemAddon {
  id: string;
  orderItemId: string;
  addonId: string;
  quantity: number;
  name?: string;             // optional for UI
  price?: number;            // optional for UI
}

// Main order interface
export interface Order {
  id: string;
  customerId: string;
  orderDate: string;         // ISO date string
  totalAmount: number;
  discountApplied: number;
  status?: "PENDING" | "PREPARING" | "COMPLETED" | "READYTOPICKUP" | "CANCELLED";
  paymentStatus?: "UNPAID" | "PAID" | "REFUNDED";
  paymentMethod?: {          // optional payment details
    type: string;
    provider?: string;
    details?: string;
    status: string;
    paidAt?: string;
  };
  orderItems: OrderItem[];
}
