import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { CartItem, CartItemAddon } from "./cart";

interface BaristaCartState {
  cart: { items: CartItem[] } | null;
  status: "idle" | "loading" | "failed";
}

const initialState: BaristaCartState = {
  cart: null,
  status: "idle",
};

// Fetch cart
export const fetchBaristaCart = createAsyncThunk(
  "baristaCart/fetchCart",
  async (customerId: string) => {
    const res = await fetch(`/api/cart?customerId=${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch barista cart");
    return (await res.json()) as { items: CartItem[] };
  },
);

// Add item
export const addBaristaItem = createAsyncThunk(
  "baristaCart/addItem",
  async (payload: {
    customerId: string;
    productId: string;
    variantId: string;
    quantity: number;
    addons?: CartItemAddon[];
  }) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add item");
    return (await res.json()) as CartItem;
  },
);

// Remove item
export const removeBaristaItem = createAsyncThunk(
  "baristaCart/removeItem",
  async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove item");
    return itemId;
  },
);

// Slice
const baristaCartSlice = createSlice({
  name: "baristaCart",
  initialState,
  reducers: {
    clearBaristaCart: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBaristaCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchBaristaCart.fulfilled,
        (state, action: PayloadAction<{ items: CartItem[] }>) => {
          state.status = "idle";
          state.cart = action.payload;
        },
      )
      .addCase(fetchBaristaCart.rejected, (state) => {
        state.status = "failed";
      })

      .addCase(
        addBaristaItem.fulfilled,
        (state, action: PayloadAction<CartItem>) => {
          if (!state.cart) state.cart = { items: [] };

          const newItem = action.payload;

          // Merge if same variant + same addons
          const existing = state.cart.items.find(
            (item) =>
              item.variantId === newItem.variantId &&
              JSON.stringify(
                item.addons?.map((a) => ({
                  addonId: a.addonId,
                  quantity: a.quantity,
                })) ?? [],
              ) ===
                JSON.stringify(
                  newItem.addons?.map((a) => ({
                    addonId: a.addonId,
                    quantity: a.quantity,
                  })) ?? [],
                ),
          );

          if (existing) {
            existing.quantity += newItem.quantity;
            existing.price =
              existing.variant.price * existing.quantity +
              (existing.addons?.reduce(
                (sum, a) => sum + a.price * a.quantity,
                0,
              ) ?? 0);
          } else {
            state.cart.items.push(newItem);
          }
        },
      )

      .addCase(
        removeBaristaItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          if (!state.cart) return;
          state.cart.items = state.cart.items.filter(
            (item) => item.id !== action.payload,
          );
        },
      );
  },
});

export default baristaCartSlice.reducer;
export const { clearBaristaCart } = baristaCartSlice.actions;
export const selectBaristaCart = (state: RootState) => state.baristaCart.cart;
