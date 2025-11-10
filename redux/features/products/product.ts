export interface Product {
  id: string;
  name: string;
  image?: string | null;
  description: string;
  isDeleted: boolean;

  variants: ProductVariant[];
  // Relations (keep as arrays of any or define separately later)
  freeItems?: any[];
  orderItems?: any[];
  cartItems?: any[];
  reviews?: any[];

  categoryId: string;
  categoryName: string;
  createdAt: string;
  updatedAt: string;

  deletedAt: string | null;
  deletedBy: string | null;
  status: "AVAILABLE" | "NOT_AVAILABLE";

  avgRating: number; // average rating of the product
  totalReviews: number; // number of reviews
}

export interface ProductVariant {
  id: string;
  productId: string;
  servingType: "HOT" | "COLD"; // from enum ServingType
  size?: string | null; // SMALL, REGULAR, LARGE, or null
  price: number;
}
