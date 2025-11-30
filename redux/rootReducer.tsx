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
import mostSoldReducer from "./features/reports/mostSoldSlice";
import revenueReducer from "./features/reports/revenueSlice";
import weeklySaleReducer from "./features/reports/weeklySaleSlice";
import totalOrderReducer from "./features/reports/totalOrderSlice";
import monthlyRevenueReducer from "./features/reports/monthlyRevenueSlice";
import stampReducer from "./features/stamp/stampSlice";
import reviewReducer from "./features/reviews/reviewSlice";
import buyoutReducer from "./features/buyout/buyoutSlice";
import stockReducer from "./features/stock/stocksSlice";

import  loyaltyProgramsReducer  from "./features/loyaltyPrograms/loyaltyProgramsSlice";
import  loyaltyTiersReducer  from "./features/loyaltyTiers/loyaltyTiersSlice";
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

  mostSold: mostSoldReducer,
  revenue: revenueReducer,
  weeklySale: weeklySaleReducer,
  totalOrder: totalOrderReducer,
  monthlyRevenue: monthlyRevenueReducer,

  stamp: stampReducer,
  reviews: reviewReducer,
  buyout: buyoutReducer,

  loyaltyPrograms: loyaltyProgramsReducer,
  loyaltyTiers: loyaltyTiersReducer,

  stock: stockReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === "auth/signOut") {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;
