import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

interface RevenueState {
  amount: number | null;
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch revenue
export const fetchRevenue = createAsyncThunk<
  number, // returned type
  { date?: string } | undefined, // argument type
  { rejectValue: string }
>("revenue/fetchRevenue", async (params, thunkAPI) => {
  try {
    const query = params?.date ? `?date=${params.date}` : "";
    const res = await fetch(`/api/reports/revenue${query}`);
    if (!res.ok) {
      return thunkAPI.rejectWithValue("Failed to fetch revenue");
    }
    const data = await res.json();
    return data.revenue ?? 0;
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

const initialState: RevenueState = {
  amount: null,
  loading: false,
  error: null,
};

const revenueSlice = createSlice({
  name: "revenue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRevenue.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.amount = action.payload;
      })
      .addCase(fetchRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export const selectRevenue = (state: RootState) => state.revenue;
export default revenueSlice.reducer;
