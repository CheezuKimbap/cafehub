export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
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
