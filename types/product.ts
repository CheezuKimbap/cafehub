export interface Product {
  id: string
  name: string
  image?: string | null
  description: string
  isDeleted: boolean
  price: number

  // Relations (keep as arrays of any or define separately later)
  freeItems?: any[]
  orderItems?: any[]
  cartItems?: any[]
  reviews?: any[]

  createdAt: string
  updatedAt: string

  deletedAt: string | null
  deletedBy: string | null
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED"
}
