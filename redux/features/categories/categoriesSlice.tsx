import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Category {
  id: string;
  name: string;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const createCategory = createAsyncThunk<Category, string>(
  "categories/create",
  async (name, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) throw new Error("Failed to create category");

      return await res.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

// ✅ Async thunk using fetch
export const fetchCategories = createAsyncThunk<Category[]>(
  "categories/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/categories");

      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await res.json();
      return data; // ✅ properly parsed JSON
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  },
);

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default categoriesSlice.reducer;
