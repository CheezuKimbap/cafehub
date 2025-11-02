// redux/features/order/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import { Order, OrderStatus, PaymentStatus } from "../order/order";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// Fetch all orders
export const fetchOrders = createAsyncThunk<Order[]>(
  "orders/fetchOrders",
  async () => {
    const res = await fetch(`/api/orders`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  }
);

// Fetch orders by customer ID
export const fetchOrdersByCustomerId = createAsyncThunk<
  Order[],
  { customerId: string }
>("orders/fetchOrdersByCustomerId", async ({ customerId }) => {
  const res = await fetch(`/api/orders?customerId=${customerId}`, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json() as Promise<Order[]>;
});

// Update order status and/or payment status
export const updateOrderStatus = createAsyncThunk<
  Order,
  { id: string; status: OrderStatus; paymentStatus?: PaymentStatus }
>("orders/updateOrderStatus", async ({ id, status, paymentStatus }) => {
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
  return data.order as Order;
});

// Slice state
export interface OrdersState {
  orders: Order[];
  status: "idle" | "loading" | "success" | "failed";
  updatingOrderIds: string[];
  error?: string;
}

const initialState: OrdersState = {
  orders: [],
  status: "idle",
  updatingOrderIds: [],
};

export const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    resetOrders: (state) => {
      state.orders = [];
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all orders
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.status = "success";
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch orders";
      })

      // Fetch by customer
      .addCase(fetchOrdersByCustomerId.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOrdersByCustomerId.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.status = "success";
          state.orders = action.payload;
        }
      )
      .addCase(fetchOrdersByCustomerId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to fetch customer orders";
      })

      // Update order status
      .addCase(updateOrderStatus.pending, (state, action) => {
        const { id, status, paymentStatus } = action.meta.arg;
        state.updatingOrderIds.push(id);

        const index = state.orders.findIndex((o) => o.id === id);
        if (index !== -1) {
          state.orders[index] = {
            ...state.orders[index],
            status,
            paymentStatus: paymentStatus ?? state.orders[index].paymentStatus,
          };
        }
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.orders.findIndex((o) => o.id === updated.id);
        if (index !== -1) {
          state.orders[index] = {
            ...updated, // full updated order from API
          };
        }
        state.updatingOrderIds = state.updatingOrderIds.filter(
          (id) => id !== updated.id
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        const { id } = action.meta.arg;
        state.updatingOrderIds = state.updatingOrderIds.filter(
          (orderId) => orderId !== id
        );
        state.error = action.error.message ?? "Failed to update order status";
      });
  },
});

// Selectors
export const selectOrders = (state: RootState) => state.order.orders;
export const selectOrderStatus = (state: RootState) => state.order.status;
export const selectUpdatingOrders = (state: RootState) =>
  state.order.updatingOrderIds;

export const { resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
