// redux/features/discount/discount.ts
export interface Discount {
  id: string;
  description: string;
  type: "PERCENTAGE_OFF" | "FREE_ITEM" | "FIXED_AMOUNT"; // add your supported types
  discountAmount?: number; // % for PERCENTAGE_OFF or fixed peso amount
  productId?: string | null; // used when FREE_ITEM applies to a product
  isForLoyalCustomer: boolean;
  isRedeemed: boolean;
  customerId: string;
  createdAt: string; // ISO string from API
  usedAt?: string | null;

  // optional nested customer (if API populates it)
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentStamps: number;
  };
}
