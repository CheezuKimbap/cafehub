import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import { Customer } from "./customer";
import { OrderStatus, PaymentStatus } from "@/prisma/generated/prisma";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// --- Thunks ---
// Register new customer
export const registerCustomer = createAsyncThunk<
  Customer,
  { firstName: string; lastName: string; email: string; password: string }
>("customer/registerCustomer", async (payload) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to register customer");
  }

  const data = await res.json();
  return {
    id: data.user.id,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email,
  };
});

// Fetch all customers
export const fetchCustomers = createAsyncThunk<Customer[], void>(
  "customer/fetchCustomers",
  async () => {
    const res = await fetch("/api/customer", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch customers");
    return (await res.json()) as Customer[];
  },
);

// Fetch single customer by ID
export const fetchCustomerById = createAsyncThunk<Customer, string>(
  "customer/fetchCustomerById",
  async (customerId) => {
    const res = await fetch(`/api/customer/${customerId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch customer");
    return (await res.json()) as Customer;
  },
);

// --- State ---
interface CustomerState {
  customers: Customer[];
  singleCustomer: Customer | null;
  status: "idle" | "loading" | "failed";
  error?: string;
}

const initialState: CustomerState = {
  customers: [],
  singleCustomer: null,
  status: "idle",
  error: undefined,
};

// --- Slice ---
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    resetCustomers: (state) => {
      state.customers = [];
      state.status = "idle";
      state.error = undefined;
    },
    resetSingleCustomer: (state) => {
      state.singleCustomer = null;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register customer
      .addCase(registerCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        registerCustomer.fulfilled,
        (state, action: PayloadAction<Customer>) => {
          state.status = "idle";
          state.singleCustomer = action.payload;

          // Prevent duplicates in the list
          state.customers = [
            ...state.customers.filter((c) => c.id !== action.payload.id),
            action.payload,
          ];
        },
      )
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Fetch all customers
      .addCase(fetchCustomers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(
        fetchCustomers.fulfilled,
        (state, action: PayloadAction<Customer[]>) => {
          state.status = "idle";
          state.customers = action.payload;
        },
      )
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Fetch single customer
      .addCase(fetchCustomerById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.status = "idle";
        state.singleCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// --- Exports ---
export const { resetCustomers, resetSingleCustomer } = customerSlice.actions;

export const selectCustomers = (state: RootState) => state.customer.customers;
export const selectCustomerTotalSpend =
  (customerId: string) => (state: RootState) => {
    const customer = state.customer.customers.find((c) => c.id === customerId);
    if (!customer || !customer.orders) return 0;

    return customer.orders
      .filter(
        (order) =>
          order.status === OrderStatus.COMPLETED &&
          order.paymentStatus === PaymentStatus.PAID,
      )
      .reduce((sum, order) => sum + order.totalAmount, 0);
  };
export const selectSingleCustomer = (state: RootState) =>
  state.customer.singleCustomer;
export const selectCustomerStatus = (state: RootState) => state.customer.status;
export const selectCustomerError = (state: RootState) => state.customer.error;

export default customerSlice.reducer;
