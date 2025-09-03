"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "@/redux/store";
import { clearCart } from "@/redux/features/cart/cartSlice";

// --- Types ---
interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

interface Order {
  id: string;
  customerId: string;
  orderDate: string;
  totalAmount: number;
  discountApplied: number;
  orderItems: OrderItem[];
}

interface CheckoutState {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: CheckoutState = {
  order: null,
  loading: false,
  error: null,
};

// --- Thunk ---
export const checkout = createAsyncThunk<
  Order,
  { customerId: string; discountApplied?: number },
  { dispatch: AppDispatch }
>("checkout/submit", async ({ customerId, discountApplied }, { dispatch }) => {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
    },
    body: JSON.stringify({ customerId, discountApplied }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Checkout failed");
  }

  const data = await res.json();
  dispatch(clearCart());
  return data.order as Order;
});

// --- Slice ---
const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    resetCheckout: (state) => {
      state.order = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkout.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.order = action.payload;
        state.error = null;
      })
      .addCase(checkout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Checkout error";
      });
  },
});

export const { resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
