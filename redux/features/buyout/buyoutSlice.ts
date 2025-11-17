import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const buyProduct = createAsyncThunk(
  "buyout/buyProduct",
  async (payload: {
    customerId: string;
    variantId: string;
    quantity: number;
    addons?: { addonId: string; quantity: number }[];
    discountId?: string;
    paymentType?: string;
    paymentProvider?: string;
    paymentDetails?: string;
    orderName?: string;
    pickupTime?: string | Date;
  }, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/buyout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) return rejectWithValue(data.error || "Buyout failed");

      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

interface BuyoutState {
  loading: boolean;
  error: string | null;
  success: boolean;
  order: any | null;
}

const initialState: BuyoutState = {
  loading: false,
  error: null,
  success: false,
  order: null,
};

const buyoutSlice = createSlice({
  name: "buyout",
  initialState,
  reducers: {
    resetBuyout(state) {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.order = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buyProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.order = null;
      })
      .addCase(buyProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.order = action.payload;
      })
      .addCase(buyProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  },
});

export const { resetBuyout } = buyoutSlice.actions;
export default buyoutSlice.reducer;
