import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/redux/features/products/product";

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const res = await fetch("/api/products", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
    },
  });

  if (!res.ok) throw new Error("Failed to fetch products");
  return (await res.json()) as Product[];
});

export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id) => {
    const res = await fetch(`/api/products?productId=${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });
    if (!res.ok) throw new Error("Failed to fetch product");
    return (await res.json()) as Product;
  }
);


type ProductsState = {
  items: Product[];
  selected?: Product | null;
  loading: boolean;
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  loading: true,
  error: null,
};

export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<Product>) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    removeProduct: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch products";
        state.loading = false;
      })
      .addCase(fetchProductById.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.selected = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.loading = false;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch product";
        state.loading = false;
      });
  },
});

export const { addProduct, updateProduct, removeProduct } = productsSlice.actions;
export default productsSlice.reducer;
