import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface WeekSaleItem {
  day: string;
  value: number;
  itemsSold: number;
}

interface WeeklySaleState {
  items: WeekSaleItem[];
  totalRevenue: number;
  totalItemsSold: number;
  loading: boolean;
  error: string | null;
}

const initialState: WeeklySaleState = {
  items: [],
  totalRevenue: 0,
  totalItemsSold: 0,
  loading: false,
  error: null,
};

// Use native fetch instead of axios
export const fetchWeeklySales = createAsyncThunk(
  "reports/fetchWeeklySales",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/reports/weekly-sale");
      if (!res.ok) {
        throw new Error("Failed to fetch weekly sales");
      }
      const data = await res.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const weeklySaleSlice = createSlice({
  name: "weeklySale",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeeklySales.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWeeklySales.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.weeklyData;
        state.totalRevenue = action.payload.totalRevenue;
        state.totalItemsSold = action.payload.totalItemsSold;
      })
      .addCase(fetchWeeklySales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectWeeklySales = (state: any) => state.weeklySale;

export default weeklySaleSlice.reducer;
