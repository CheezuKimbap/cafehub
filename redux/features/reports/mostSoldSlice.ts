import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

export interface MostSoldItem {
  name: string;
  value: number;
}

interface MostSoldState {
  items: MostSoldItem[];
  loading: boolean;
  error: string | null;
}

const initialState: MostSoldState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunk to fetch data from API
export const fetchMostSold = createAsyncThunk<
  MostSoldItem[],
  void,
  { rejectValue: string }
>("mostSold/fetchMostSold", async (_, thunkAPI) => {
  try {
    const res = await fetch("/api/reports/most-sold");
    if (!res.ok) {
      return thunkAPI.rejectWithValue("Failed to fetch most sold items");
    }
    const data = await res.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

const mostSoldSlice = createSlice({
  name: "mostSold",
  initialState,
  reducers: {
    clearMostSold(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMostSold.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMostSold.fulfilled,
        (state, action: PayloadAction<MostSoldItem[]>) => {
          state.loading = false;
          state.items = action.payload;
        },
      )
      .addCase(fetchMostSold.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export const { clearMostSold } = mostSoldSlice.actions;
export const selectMostSold = (state: RootState) => state.mostSold;
export default mostSoldSlice.reducer;
