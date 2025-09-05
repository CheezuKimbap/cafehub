// src/redux/features/customer/customerSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/redux/store";
import { Customer } from "./customer";

// --- Types ---

export interface CustomerState {
  customer: Customer | null;
  status: "idle" | "loading" | "failed";
  error?: string;
}

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// --- Thunks ---
// Register new customer
export const registerCustomer = createAsyncThunk<
  Customer,
  { firstName: string; lastName: string; email: string; password: string }
>("customer/registerCustomer", async (payload) => {
  const res = await fetch("/api/auth/signup", {
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

// Optionally: fetch customer by ID
export const fetchCustomer = createAsyncThunk<Customer, string>(
  "customer/fetchCustomer",
  async (id) => {
    const res = await fetch(`/api/customers/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
    });

    if (!res.ok) throw new Error("Failed to fetch customer");

    return res.json();
  }
);

// --- State ---
const initialState: CustomerState = {
  customer: null,
  status: "idle",
};

// --- Slice ---
const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    resetCustomer: (state) => {
      state.customer = null;
      state.status = "idle";
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.status = "idle";
        state.customer = action.payload;
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      // Fetch
      .addCase(fetchCustomer.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCustomer.fulfilled, (state, action: PayloadAction<Customer>) => {
        state.status = "idle";
        state.customer = action.payload;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

// --- Exports ---
export const { resetCustomer } = customerSlice.actions;
export const selectCustomer = (state: RootState) => state.customer.customer;
export const selectCustomerStatus = (state: RootState) => state.customer.status;
export const selectCustomerError = (state: RootState) => state.customer.error;

export default customerSlice.reducer;
