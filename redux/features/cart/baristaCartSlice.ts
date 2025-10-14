// src/redux/features/cart/baristaCartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import type {
  Cart,
  CartState,
  CartItem,
  CartItemAddon,
} from "@/redux/features/cart/cart";

// ------------------------------------
// Thunks
// ------------------------------------
export const fetchBaristaCart = createAsyncThunk<Cart, string>(
  "baristaCart/fetchCart",
  async (customerId: string) => {
    const res = await fetch(`/api/cart?customerId=${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    return await res.json();
  },
);

export const addBaristaItem = createAsyncThunk<
  Cart,
  {
    customerId: string;
    productId: string;
    quantity: number;
    servingType: string;
    addons: CartItemAddon[];
  }
>("baristaCart/addItem", async (payload) => {
  const res = await fetch(`/api/cart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return await res.json();
});

export const updateBaristaItem = createAsyncThunk<
  Cart,
  { itemId: string; quantity: number }
>("baristaCart/updateItem", async ({ itemId, quantity }) => {
  const res = await fetch(`/api/cart/${itemId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return await res.json();
});

export const removeBaristaItem = createAsyncThunk<Cart, string>(
  "baristaCart/removeItem",
  async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to remove item");
    return await res.json();
  },
);

export const clearBaristaCart = createAsyncThunk<Cart, string>(
  "baristaCart/clearCart",
  async (customerId: string) => {
    const res = await fetch(`/api/cart?customerId=${customerId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to clear cart");
    return await res.json();
  },
);

// ------------------------------------
// Slice
// ------------------------------------
const initialState: CartState = {
  cart: null,
  status: "idle",
};

const baristaCartSlice = createSlice({
  name: "baristaCart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchBaristaCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchBaristaCart.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.status = "idle";
          state.cart = action.payload;
        },
      )
      .addCase(fetchBaristaCart.rejected, (state) => {
        state.status = "failed";
      })

      // add item
      .addCase(
        addBaristaItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.status = "idle";
        },
      )

      // update item
      .addCase(
        updateBaristaItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.status = "idle";
        },
      )

      // remove item
      .addCase(
        removeBaristaItem.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.status = "idle";
        },
      )

      // clear cart
      .addCase(
        clearBaristaCart.fulfilled,
        (state, action: PayloadAction<Cart>) => {
          state.cart = action.payload;
          state.status = "idle";
        },
      );
  },
});

// ------------------------------------
// Selectors
// ------------------------------------
export const selectBaristaCart = (state: RootState) => state.baristaCart.cart;

export default baristaCartSlice.reducer;
