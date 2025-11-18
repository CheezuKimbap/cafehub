export interface LoyaltyTier {
  id: string;
  name: string;
  description?: string;
  pointsRequired: number;
  // Allow dynamic fields
  [key: string]: any;
}

export interface LoyaltyTiersState {
  list: LoyaltyTier[];
  loading: boolean;
  error: string | null;
}
