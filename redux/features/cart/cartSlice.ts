import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { Cart, CartItem, CartItemAddon } from "./cart"; // 👈 make sure CartItemAddon exists

// Initial state
interface CartState {
  cart: Cart | null;
  status: "idle" | "loading" | "failed";
}

const initialState: CartState = {
  cart: null,
  status: "idle",
};

// --------------------
// Thunks
// --------------------

// Fetch cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (customerId: string) => {
    const res = await fetch(`/api/cart?customerId=${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    return (await res.json()) as Cart;
  },
);

// Add item to cart
export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (payload: {
    customerId: string;
    productId: string;
    quantity: number;
    servingType: string;
    addons?: { addonId: string; quantity: number }[];
  }) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add item to cart");
    return (await res.json()) as CartItem;
  },
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async (payload: { itemId: string; quantity: number }) => {
    const res = await fetch(`/api/cart/${payload.itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: payload.quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
    return (await res.json()) as CartItem;
  },
);

// Remove cart item
export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete cart item");
    }
    return itemId; // Return the deleted item's ID
  },
);

// --------------------
// Slice
// --------------------
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic update for base item
    updateCartItemOptimistic: (state, action: PayloadAction<CartItem>) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.map((item) =>
        item.id === action.payload.id ? action.payload : item,
      );
    },

    // Update item quantity locally
    updateItemQuantityLocally: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>,
    ) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.map((item) =>
        item.id === action.payload.itemId
          ? {
              ...item,
              quantity: action.payload.quantity,
              price: item.product.price * action.payload.quantity, // recalc base total
            }
          : item,
      );
    },

    // Clear cart
    clearCart: (state) => {
      state.cart = null;
    },

    // --------------------
    // Addon operations
    // --------------------
    addAddonToCartItem: (
      state,
      action: PayloadAction<{ itemId: string; addon: CartItemAddon }>,
    ) => {
      if (!state.cart) return;
      const item = state.cart.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        const existing = item.addons.find(
          (a) => a.addonId === action.payload.addon.addonId,
        );
        if (existing) {
          existing.quantity += action.payload.addon.quantity;
        } else {
          item.addons.push(action.payload.addon);
        }
      }
    },

    removeAddonFromCartItem: (
      state,
      action: PayloadAction<{ itemId: string; addonId: string }>,
    ) => {
      if (!state.cart) return;
      const item = state.cart.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        item.addons = item.addons.filter(
          (a) => a.addonId !== action.payload.addonId,
        );
      }
    },

    updateAddonQuantity: (
      state,
      action: PayloadAction<{
        itemId: string;
        addonId: string;
        quantity: number;
      }>,
    ) => {
      if (!state.cart) return;
      const item = state.cart.items.find((i) => i.id === action.payload.itemId);
      if (item) {
        const addon = item.addons.find(
          (a) => a.addonId === action.payload.addonId,
        );
        if (addon) {
          addon.quantity = action.payload.quantity;
        }
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.status = "idle";
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = "failed";
      })

      // Add item
      .addCase(
        addItemToCart.fulfilled,
        (state, action: PayloadAction<CartItem>) => {
          if (!state.cart) {
            state.cart = {
              id: "temp",
              customerId: "",
              items: [],
              status: "ACTIVE",
            };
          }
          state.cart.items.push(action.payload);
        },
      )

      .addCase(
        updateCartItem.fulfilled,
        (state, action: PayloadAction<CartItem>) => {
          if (!state.cart) return;

          state.cart.items = state.cart.items.map((item) => {
            if (item.id === action.payload.id) {
              // if API didn’t return addons, keep the old ones
              return {
                ...action.payload,
                addons: action.payload.addons ?? item.addons,
              };
            }
            return item;
          });
        },
      )

      // Remove item
      .addCase(
        removeCartItem.fulfilled,
        (state, action: PayloadAction<string>) => {
          if (!state.cart) return;
          state.cart.items = state.cart.items.filter(
            (item) => item.id !== action.payload,
          );
        },
      );
  },
});

export default cartSlice.reducer;

// Export actions
export const {
  updateCartItemOptimistic,
  clearCart,
  updateItemQuantityLocally,
  addAddonToCartItem,
  removeAddonFromCartItem,
  updateAddonQuantity,
} = cartSlice.actions;

// Selector
export const selectCart = (state: RootState) => state.cart.cart;
