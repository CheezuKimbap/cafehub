"use client";

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "@/redux/store";
import { clearCart } from "@/redux/features/cart/cartSlice";
import { Order } from "./checkout";

// --- Types ---
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
  { customerId: string; discountId?: string },
  { dispatch: AppDispatch }
>("checkout/submit", async ({ customerId, discountId }, { dispatch }) => {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY!,
    },
    body: JSON.stringify({ customerId, discountId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Checkout failed" }));
    throw new Error(err.error || "Checkout failed");
  }

  const data = await res.json();

  // Clear cart after successful checkout
  dispatch(clearCart());

  // Return order object (with proper type)
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

// --- Selectors ---
export const selectCheckoutOrder = (state: RootState) => state.checkout.order;
export const selectCheckoutLoading = (state: RootState) =>
  state.checkout.loading;
export const selectCheckoutError = (state: RootState) => state.checkout.error;

export const { resetCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
