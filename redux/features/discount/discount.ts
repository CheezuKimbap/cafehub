export interface Discount {
  id: string;
  description: string;
  discountAmount: number;
  isForLoyalCustomer: boolean;
  isRedeemed: boolean;
  customerId: string;
  createdAt: string; // ISO string from API
  usedAt?: string | null; // may be null if not redeemed
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    currentStamps: number;
    // add other customer fields you care about
  };
}
