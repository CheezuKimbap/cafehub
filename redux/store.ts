import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/products/productsSlice";
import cartReducer from "./features/cart/cartSlice";
import checkoutReducer from "./features/checkout/checkoutSlice";
import orderReducer from "./features/order/orderSlice"
import { cartSlice } from "./features/cart/cartSlice";
import { checkout } from "./features/checkout/checkoutSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
    cart: cartReducer,
    checkout: checkoutReducer,
    order: orderReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
