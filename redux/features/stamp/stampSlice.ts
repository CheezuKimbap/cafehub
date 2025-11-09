import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Customer } from "@/redux/features/customer/customer"; // adjust path
import { RootState } from "@/redux/store";

// Async thunk to add stamps
export const addStamp = createAsyncThunk<
  { id: string; currentStamps: number },
  { id: string; stamps?: number },
  { rejectValue: string }
>("stamp/addStamp", async ({ id, stamps = 1 }, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/stamps", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, stamps }),
    });

    if (!res.ok) {
      const error = await res.json();
      return rejectWithValue(error?.error || "Failed to add stamp");
    }

    const data = await res.json();
    return { id, currentStamps: data.currentStamps };
  } catch (err) {
    console.error(err);
    return rejectWithValue("Network error");
  }
});

interface StampState {
  customers: Customer[];
  loading: boolean;
  error: string | null;
}

const initialState: StampState = {
  customers: [],
  loading: false,
  error: null,
};

export const stampSlice = createSlice({
  name: "stamp",
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.customers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addStamp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addStamp.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.customers.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.customers[index].currentStamps = action.payload.currentStamps;
        }
      })
      .addCase(addStamp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add stamp";
      });
  },
});

export const { setCustomers } = stampSlice.actions;

export const selectCustomers = (state: RootState) => state.stamp.customers;

export default stampSlice.reducer;
