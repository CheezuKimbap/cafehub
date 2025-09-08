// redux/features/order/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "../order/order";
import type { RootState } from "@/redux/store";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// get list of all orders
export const fetchOrders = createAsyncThunk<Order[]>(
  "orders/fetchOrders",
  async () => {
    const res = await fetch(`/api/orders`, {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to fetch orders");
    }

    return res.json();
  }
);

// orderSlice.ts
export const fetchOrdersByCustomerId = createAsyncThunk<
  Order[],
  { customerId: string }
>("order/fetchOrdersByCustomerId", async ({ customerId }) => {
  const res = await fetch(`/api/orders?customerId=${customerId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return (await res.json()) as Order[];
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
  updatingOrderIds: string[]; // track which orders are being updated
  error?: string;
}
const initialState: OrdersState = {
  orders: [],
  status: "idle",
  updatingOrderIds: [],
};
const ordersSlice = createSlice({
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
        state.error = action.error.message;
      })
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.status = "success";
          state.orders = action.payload;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Something went wrong";
      })
      .addCase(updateOrderStatus.pending, (state, action) => {
        state.updatingOrderIds.push(action.meta.arg.id);
      })
      // ordersSlice.ts
      .addCase(
        updateOrderStatus.fulfilled,
        (
          state,
          action: PayloadAction<{
            id: string;
            status: OrderStatus;
            paymentStatus?: PaymentStatus;
          }>
        ) => {
          const updated = action.payload;
          const index = state.orders.findIndex((o) => o.id === updated.id);
          if (index !== -1) {
            // Merge the new status and paymentStatus into the existing order
            state.orders[index] = {
              ...state.orders[index],
              status: updated.status,
              paymentStatus:
                updated.paymentStatus ?? state.orders[index].paymentStatus,
            };
          }
        }
      )

      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Failed to update order status";
      });
  },
});

export const selectOrders = (state: RootState) => state.order?.orders ?? [];
export const selectOrderStatus = (state: RootState) =>
  state.order?.status ?? "idle";

export default ordersSlice.reducer;
