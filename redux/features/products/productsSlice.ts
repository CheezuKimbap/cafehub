import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/redux/features/products/product";

interface UpdateProductPayload {
  id: string;
  formData: FormData;
}
// --------------------
// Async Thunks
// --------------------
export const fetchProducts = createAsyncThunk(
  "products/fetch",
  async (_, { getState }) => {
    const state = getState() as { products: ProductsState };

    // ✅ Cache valid for 1 minute
    if (
      state.products.items.length > 0 &&
      state.products.lastFetched &&
      Date.now() - state.products.lastFetched < 60_000
    ) {
      return state.products.items; // use cache
    }

    const res = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch products");
    return (await res.json()) as Product[];
  },
);

export const fetchProductById = createAsyncThunk<Product, string>(
  "products/fetchById",
  async (id, { getState }) => {
    const state = getState() as { products: ProductsState };

    // ✅ Return cached product if available
    const cached = state.products.items.find((p) => p.id === id);
    if (cached) return cached;

    const res = await fetch(`/api/products/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch product");
    return (await res.json()) as Product;
  },
);

// Inside your products slice file
export const submitProduct = createAsyncThunk<
  Product, // return type
  FormData, // argument type
  { rejectValue: string } // type for rejectWithValue
>("products/submit", async (formData, { rejectWithValue }) => {
  try {
    // 1️⃣ Upload image
    const imageFile = formData.get("image") as File | null;
    let imageUrl = "";
    if (imageFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    const canDiscountRaw = formData.get("canDiscount");
    const canDiscount = canDiscountRaw === "true" || canDiscountRaw === "on";

    // 2️⃣ Product payload
    const product = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: Number(formData.get("price")),
      stock: Number(formData.get("stock")),
      image: imageUrl,
      categoryId: formData.get("categoryId") as string,
      canDiscount,
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify(product),
    });

    if (!res.ok) throw new Error("Failed to save product");

    return (await res.json()) as Product;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});
export const updateProductById = createAsyncThunk<
  Product, // return type
  UpdateProductPayload, // argument type
  { rejectValue: string } // for rejectWithValue
>("products/update", async ({ id, formData }, { rejectWithValue }) => {
  try {
    // 1️⃣ Upload image if provided
    const imageFile = formData.get("image") as File | null;
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadForm,
      });

      if (!uploadRes.ok) throw new Error("Image upload failed");

      const uploadData = await uploadRes.json();
      imageUrl = uploadData.url;
    }

    // 2️⃣ Build payload for update
    const payload: any = {
      name: formData.get("name") as string | undefined,
      description: formData.get("description") as string | undefined,
      price: formData.get("price") ? Number(formData.get("price")) : undefined,
      stock: formData.get("stock") ? Number(formData.get("stock")) : undefined,
      ...(imageUrl && { image: imageUrl }),
    };

    // Remove undefined fields
    Object.keys(payload).forEach(
      (key) => payload[key] === undefined && delete payload[key],
    );

    // 3️⃣ Call PUT endpoint
    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to update product");

    return (await res.json()) as Product;
  } catch (error: any) {
    return rejectWithValue(error.message);
  }
});

// --------------------
// Slice State
// --------------------
type ProductsState = {
  items: Product[];
  selected?: Product | null;
  loading: boolean;
  error: string | null;
  lastFetched?: number;
};

const initialState: ProductsState = {
  items: [],
  loading: true,
  error: null,
  lastFetched: undefined,
};

// --------------------
// Slice
// --------------------
export const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearCache: (state) => {
      state.lastFetched = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.lastFetched = Date.now(); // ⏱️ mark last fetch
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch products";
        state.loading = false;
      })
      // Fetch by ID
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selected = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.selected = action.payload;
        state.loading = false;

        // Optionally merge into items list if missing
        const exists = state.items.find((p) => p.id === action.payload.id);
        if (!exists) {
          state.items.push(action.payload);
        }
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.error = action.error.message || "Failed to fetch product";
        state.loading = false;
      })
      // Submit product
      .addCase(submitProduct.fulfilled, (state, action) => {
        state.items.push(action.payload); // ✅ directly add item
        // no loading change
      })
      .addCase(submitProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updateProductById.fulfilled, (state, action) => {
        const index = state.items.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload; // update existing product in store
        }
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCache } = productsSlice.actions;

export default productsSlice.reducer;
