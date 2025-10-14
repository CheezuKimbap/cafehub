import { ServingType } from "@/prisma/generated/prisma";

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  servingType: ServingType;
  priceAtPurchase: number;
}

export interface Order {
  id: string;
  customerId: string;
  orderDate: string; // ISO date string
  totalAmount: number;
  discountApplied: number;
  orderItems: OrderItem[];
}
