// redux/features/order/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "../order/order";
import type { RootState } from "@/redux/store";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

//get list orders
export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
  const result = await fetch("/api/orders", {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });
  if (!result.ok) throw new Error("Failed to fetch orders");
  return result.json();
});

// orderSlice.ts
export const fetchOrdersbyCustomerId = createAsyncThunk<
  Order[],
  { customerId?: string } | void
>("orders/fetchOrdersbyCustomerId", async (params) => {
  const query = params?.customerId ? `?customerId=${params.customerId}` : "";
  const res = await fetch(`/api/orders${query}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
});
// --- Thunks ---
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: OrderStatus; paymentStatus?: PaymentStatus }
>("order/updateOrderStatus", async ({ id, status, paymentStatus }) => {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({ status, paymentStatus }),
  });
  if (!res.ok) throw new Error("Failed to update order");
  const data = await res.json();
  return data.order;
});

export interface OrdersState {
  orders: Order[];
  status: "idle" | "loading" | "failed" | "success";
  error?: string;
}

const initialState: OrdersState = { orders: [], status: "idle" };

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersbyCustomerId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOrdersbyCustomerId.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.status = "idle";
          state.orders = action.payload;
        }
      )
      .addCase(fetchOrdersbyCustomerId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "success"; // ✅ must match type
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      });
  },
});

export const selectOrders = (state: RootState) => state.order.orders;
export default ordersSlice.reducer;
