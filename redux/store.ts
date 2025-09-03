import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/products/productsSlice";
import cartReducer from "./features/cart/cartSlice";
import checkoutReducer from "./features/checkout/checkoutSlice";
import { cartSlice } from "./features/cart/cartSlice";
import { checkout } from "./features/checkout/checkoutSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
  },
});

// ✅ types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
