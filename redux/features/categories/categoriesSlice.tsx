import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface Category {
  id: string;
  name: string;
}

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetched: boolean; // ✅ added to prevent repeated fetches
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
  fetched: false,
};

// Create category
export const createCategory = createAsyncThunk<
  Category,
  string,
  { rejectValue: string }
>("categories/create", async (name, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) throw new Error("Failed to create category");

    const data: Category = await res.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// Fetch categories
export const fetchCategories = createAsyncThunk<
  Category[],
  void,
  { rejectValue: string }
>("categories/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    const data: Category[] = await res.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

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
        state.categories = action.payload;
        state.fetched = true; // mark fetched
        state.loading = false;
      })
      .addCase(
        fetchCategories.rejected,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.error = action.payload;
        },
      );
  },
});

export default categoriesSlice.reducer;
