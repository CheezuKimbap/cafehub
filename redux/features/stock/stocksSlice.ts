import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";

export interface Stock {
  id: string;
  paperCupCount: number;
  plasticCupCount: number;
}

interface StockState {
  stock: Stock | null;
  status: "idle" | "loading" | "success" | "failed";
  error?: string;
}

const initialState: StockState = {
  stock: null,
  status: "idle",
};

// GET stock (only 1)
export const fetchStock = createAsyncThunk<Stock>(
  "stock/fetchStock",
  async () => {
    const res = await fetch("/api/stock");

    if (!res.ok) {
      throw new Error("Failed to fetch stock");
    }

    return res.json();
  }
);

// CREATE stock (only once)
export const createStock = createAsyncThunk<
  Stock,
  { paperCupCount: number; plasticCupCount: number }
>("stock/createStock", async ({ paperCupCount, plasticCupCount }) => {
  const res = await fetch("/api/stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paperCupCount, plasticCupCount }),
  });

  if (!res.ok) throw new Error("Failed to create stock");

  return res.json();
});

// UPDATE stock
export const updateStock = createAsyncThunk<
  Stock,
  { paperCupCount: number; plasticCupCount: number }
>("stock/updateStock", async ({ paperCupCount, plasticCupCount }) => {
  const res = await fetch("/api/stock", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paperCupCount, plasticCupCount }),
  });

  if (!res.ok) throw new Error("Failed to update stock");

  return res.json();
});

export const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    resetStock: (state) => {
      state.stock = null;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // === FETCH ===
      .addCase(fetchStock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStock.fulfilled, (state, action: PayloadAction<Stock>) => {
        state.status = "success";
        state.stock = action.payload;
      })
      .addCase(fetchStock.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // === CREATE ===
      .addCase(createStock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createStock.fulfilled, (state, action: PayloadAction<Stock>) => {
        state.status = "success";
        state.stock = action.payload;
      })
      .addCase(createStock.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })

      // === UPDATE ===
      .addCase(updateStock.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateStock.fulfilled, (state, action: PayloadAction<Stock>) => {
        state.status = "success";
        state.stock = action.payload;
      })
      .addCase(updateStock.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { resetStock } = stockSlice.actions;

// SELECTORS
export const selectStock = (state: RootState) => state.stock.stock;
export const selectStockStatus = (state: RootState) => state.stock.status;
export const selectStockError = (state: RootState) => state.stock.error;

export default stockSlice.reducer;
