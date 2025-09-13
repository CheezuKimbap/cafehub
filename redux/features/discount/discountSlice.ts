// redux/features/discount/discountSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import { Discount } from "./discount";

// State type
interface DiscountState {
  discounts: Discount[];
  discount: Discount | null;
  loading: boolean;
  error: string | null;
}

const initialState: DiscountState = {
  discounts: [],
  discount: null,
  loading: false,
  error: null,
};

// ✅ Fetch all discounts for a customer
export const fetchDiscountsByCustomer = createAsyncThunk<
  Discount[],
  string,
  { rejectValue: string }
>("discount/fetchByCustomer", async (customerId, thunkAPI) => {
  try {
    const res = await fetch(`/api/discount?customerId=${customerId}`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string },
    });

    if (!res.ok) {
      const err = await res.json();
      return thunkAPI.rejectWithValue(err.error || "Failed to fetch discounts");
    }

    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

// ✅ Fetch single discount by ID
export const fetchDiscountById = createAsyncThunk<
  Discount,
  string,
  { rejectValue: string }
>("discount/fetchById", async (id, thunkAPI) => {
  try {
    const res = await fetch(`/api/discount/${id}`, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string },
    });
    if (!res.ok) {
      const err = await res.json();
      return thunkAPI.rejectWithValue(err.error || "Failed to fetch discount");
    }
    return await res.json();
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

// ✅ Update discount
export const updateDiscount = createAsyncThunk<
  Discount,
  { id: string; data: Partial<Discount> },
  { rejectValue: string }
>("discount/update", async ({ id, data }, thunkAPI) => {
  try {
    const res = await fetch(`/api/discount/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      return thunkAPI.rejectWithValue(err.error || "Failed to update discount");
    }
    const json = await res.json();
    return json.discount;
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

// ✅ Delete discount
export const deleteDiscount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("discount/delete", async (id, thunkAPI) => {
  try {
    const res = await fetch(`/api/discount/${id}`, {
      method: "DELETE",
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY as string },
    });
    if (!res.ok) {
      const err = await res.json();
      return thunkAPI.rejectWithValue(err.error || "Failed to delete discount");
    }
    return id;
  } catch (err) {
    return thunkAPI.rejectWithValue("Network error");
  }
});

// ✅ Slice
const discountSlice = createSlice({
  name: "discount",
  initialState,
  reducers: {
    clearDiscount(state) {
      state.discount = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchDiscountsByCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountsByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload;
      })
      .addCase(fetchDiscountsByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching discounts";
      })
      // Fetch one
      .addCase(fetchDiscountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload;
      })
      .addCase(fetchDiscountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching discount";
      })
      // Update
      .addCase(updateDiscount.fulfilled, (state, action) => {
        state.discount = action.payload;
        state.discounts = state.discounts.map((d) =>
          d.id === action.payload.id ? action.payload : d
        );
      })
      .addCase(updateDiscount.rejected, (state, action) => {
        state.error = action.payload || "Error updating discount";
      })
      // Delete
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter((d) => d.id !== action.payload);
        if (state.discount?.id === action.payload) state.discount = null;
      })
      .addCase(deleteDiscount.rejected, (state, action) => {
        state.error = action.payload || "Error deleting discount";
      });
  },
});

export const { clearDiscount } = discountSlice.actions;

// ✅ Selectors
export const selectDiscount = (state: RootState) => state.discount.discount;
export const selectDiscounts = (state: RootState) => state.discount.discounts;
export const selectDiscountLoading = (state: RootState) =>
  state.discount.loading;
export const selectDiscountError = (state: RootState) => state.discount.error;

export default discountSlice.reducer;
