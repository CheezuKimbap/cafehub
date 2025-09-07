import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { Cart, CartItem } from "./cart";

// Initial state
interface CartState {
  cart: Cart | null;
  status: "idle" | "loading" | "failed";
}

const initialState: CartState = {
  cart: null,
  status: "idle",
};

// Fetch cart
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
  async (payload: {
    customerId: string;
    productId: string;
    quantity: number;
    servingType: string;
  }) => {
    const res = await fetch(`/api/cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to add item to cart");
    return (await res.json()) as CartItem;
  }
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
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async (itemId: string) => {
    const res = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to delete cart item");
    }
    return itemId; // Return the deleted item's ID
  }
);



const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Optimistic update for quantity
    updateCartItemOptimistic: (state, action: PayloadAction<CartItem>) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.map((item) =>
        item.id === action.payload.id ? action.payload : item
      );
    },

     updateItemQuantityLocally: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      if (!state.cart) return;
      state.cart.items = state.cart.items.map((item) =>
        item.id === action.payload.itemId
          ? {
              ...item,
              quantity: action.payload.quantity,
              price: item.product.price * action.payload.quantity, // update total price
            }
          : item
      );
    },
     clearCart: (state) => {
    state.cart = null; // or state.cart.items = [] if you prefer to keep the cart object
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

      // Add item to cart
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<CartItem>) => {
        if (!state.cart) {
          state.cart = { id: "temp", customerId: "", items: [], status: "ACTIVE" };
        }
        state.cart.items.push(action.payload);
      })

      // Update quantity
      .addCase(updateCartItem.fulfilled, (state, action: PayloadAction<CartItem>) => {
        if (!state.cart) return;
        state.cart.items = state.cart.items.map((item) =>
          item.id === action.payload.id ? action.payload : item
        );
      })

      .addCase(removeCartItem.fulfilled, (state, action: PayloadAction<string>) => {
        if (!state.cart) return;
        state.cart.items = state.cart.items.filter(
          (item) => item.id !== action.payload
        );
      });

  },
});

export default cartSlice.reducer;

// Export action for optimistic updates
export const { updateCartItemOptimistic, clearCart ,updateItemQuantityLocally } = cartSlice.actions;

// Selector
export const selectCart = (state: RootState) => state.cart.cart;
