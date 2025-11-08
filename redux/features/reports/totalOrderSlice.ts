// redux/features/orders/totalOrderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface TotalOrderState {
  total: number | null;
  loading: boolean;
  error: string | null;
}

const initialState: TotalOrderState = {
  total: null,
  loading: false,
  error: null,
};

// Async thunk to fetch total orders
export const fetchTotalOrders = createAsyncThunk<
  number, // return type
  void,   // argument type
  { rejectValue: string }
>("totalOrder/fetchTotalOrders", async (_, thunkAPI) => {
  try {
    const res = await fetch("/api/reports/total-order");
    if (!res.ok) {
      return thunkAPI.rejectWithValue("Failed to fetch total orders");
    }
    const data = await res.json();
    return data.totalOrders;
  } catch (error) {
    return thunkAPI.rejectWithValue("Failed to fetch total orders");
  }
});

const totalOrderSlice = createSlice({
  name: "totalOrder",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTotalOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTotalOrders.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.total = action.payload;
      })
      .addCase(fetchTotalOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export default totalOrderSlice.reducer;
