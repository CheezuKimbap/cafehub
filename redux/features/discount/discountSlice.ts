// redux/features/discount/discountSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Discount } from "./discount";

// Example: fetch discounts thunk (adjust API as needed)
export const fetchDiscounts = createAsyncThunk(
  "discount/fetchDiscounts",
  async (customerId: string) => {
    const res = await fetch(`/api/discount?customerId=${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch discounts");
    return (await res.json()) as Discount[];
  }
);

interface DiscountState {
  discounts: Discount[];
  discount: Discount | null; // currently applied discount (if needed)
  selectedVoucherId: string | null; // 🔹 added here
  loading: boolean;
  error: string | null;
}

const initialState: DiscountState = {
  discounts: [],
  discount: null,
  selectedVoucherId: null,
  loading: false,
  error: null,
};

const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount(state) {
      state.discount = null;
      state.selectedVoucherId = null;
    },
    setSelectedVoucher(state, action: PayloadAction<string | null>) {
      state.selectedVoucherId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch discounts";
      });
  },
});
// redux/features/discount/discountSlice.ts
export const selectDiscounts = (state: { discount: DiscountState }) =>
  state.discount.discounts;
export const selectSelectedVoucherId = (state: { discount: DiscountState }) =>
  state.discount.selectedVoucherId;

export const { clearDiscount, setSelectedVoucher } = discountSlice.actions;
export default discountSlice.reducer;
