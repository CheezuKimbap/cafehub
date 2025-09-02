import { configureStore } from "@reduxjs/toolkit";
import productReducer from "./features/products/productsSlice";

export const store = configureStore({
  reducer: {
    products: productReducer,
  },
});

// ✅ types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
