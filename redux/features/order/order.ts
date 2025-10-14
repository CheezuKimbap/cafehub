import { Customer, ServingType } from "@/prisma/generated/prisma";
import { Product } from "@/redux/features/products/product";

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "COMPLETED"
  | "READYTOPICKUP"
  | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  servingType: ServingType;
  priceAtPurchase: number;
  product: Product; // Include product info for UI
  addons: OrderItemAddon[];
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string; // ISO date
  totalAmount: number;
  discountApplied?: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderItems: OrderItem[];
  customer: Customer;
  paymentMethod?: {
    type: string;
    provider?: string;
    details?: string;
    status: string;
    paidAt?: string;
  };
}

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
