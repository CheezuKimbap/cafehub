// src/redux/rootReducer.ts
import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./features/products/productsSlice";
import cartReducer from "./features/cart/cartSlice";
import checkoutReducer from "./features/checkout/checkoutSlice";
import orderReducer from "./features/order/orderSlice";
import customerReducer from "./features/customer/customerSlice";
import discountReducer from "./features/discount/discountSlice";
import addonReducer from "./features/addons/addonsSlice";
import profileReducer from "./features/profile/profileslice";
import baristaCartReducer from "./features/cart/baristaCartSlice";
import categoriesReducer from "./features/categories/categoriesSlice";

const appReducer = combineReducers({
  products: productReducer,
  cart: cartReducer,
  checkout: checkoutReducer,
  order: orderReducer,
  customer: customerReducer,
  discount: discountReducer,
  addon: addonReducer,
  profile: profileReducer,
  categories: categoriesReducer,

  baristaCart: baristaCartReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/signOut") {
    state = undefined; // 🔥 clears all slices
  }
  return appReducer(state, action);
};

export default rootReducer;
