import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Cart, CartItem, CartState } from "./cart";


// ------------------------
// Initial state
// ------------------------
const initialState: CartState = {
  cart: null,
  status: "idle",
};

// ------------------------
// Async thunks
// ------------------------

// Fetch customer cart
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (customerId: string) => {
    const res = await fetch(`/api/cart?customerId=${customerId}`);
    if (!res.ok) throw new Error("Failed to fetch cart");
    return (await res.json()) as Cart;
  }
);

// Add item to cart
export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async (payload: { customerId: string; productId: string; quantity: number, servingType: string  }) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add item to cart");
    return await res.json(); // returns message
  }
);

// Update cart item quantity
export const updateCartItem = createAsyncThunk(
  "cart/updateItem",
  async (payload: { itemId: string; quantity: number}) => {
    const res = await fetch(`/api/cart/${payload.itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: payload.quantity }),
    });
    if (!res.ok) throw new Error("Failed to update cart item");
    return (await res.json()) as CartItem;
  }
);

// Remove cart item
export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to remove cart item");
    return itemId;
  }
);

// ------------------------
// Slice
// ------------------------
export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.cart = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<Cart>) => {
        state.cart = action.payload;
        state.status = "idle";
      })
      .addCase(fetchCart.rejected, (state) => {
        state.status = "failed";
      })

      // Update cart item
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem>) => {
        if (!state.cart) return;
        const index = state.cart.items.findIndex(i => i.id === action.payload.id);
        if (index !== -1) state.cart.items[index] = action.payload;
      })

      // Remove cart item
      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<string>) => {
        if (!state.cart) return;
        state.cart.items = state.cart.items.filter(i => i.id !== action.payload);
        })


      // Add item to cart → just mark idle (call fetchCart after if you want full updated cart)
      .addCase(addItemToCart.fulfilled, (state) => {
        state.status = "idle";
      });
  },
});

export const { clearCart } = cartSlice.actions;
export default cartSlice.reducer;
