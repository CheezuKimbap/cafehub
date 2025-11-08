// redux/features/monthlyRevenue/monthlyRevenueSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

export interface MonthlyRevenueItem {
  month: string;
  profit: number;
  loss: number;
}

interface MonthlyRevenueState {
  monthlyData: MonthlyRevenueItem[];
  loading: boolean;
  error: string | null;
}

// Async thunk to fetch monthly revenue
export const fetchMonthlyRevenue = createAsyncThunk<
  MonthlyRevenueItem[],
  void,
  { rejectValue: string }
>("monthlyRevenue/fetchMonthlyRevenue", async (_, thunkAPI) => {
  try {
    const res = await fetch("/api/reports/monthly-revenue");
    if (!res.ok) {
      throw new Error("Failed to fetch");
    }
    const data = await res.json();
    return data.monthlyData;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const initialState: MonthlyRevenueState = {
  monthlyData: [],
  loading: false,
  error: null,
};

const monthlyRevenueSlice = createSlice({
  name: "monthlyRevenue",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action: PayloadAction<MonthlyRevenueItem[]>) => {
        state.loading = false;
        state.monthlyData = action.payload;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Something went wrong";
      });
  },
});

export const selectMonthlyRevenue = (state: RootState) => state.monthlyRevenue;
export default monthlyRevenueSlice.reducer;
