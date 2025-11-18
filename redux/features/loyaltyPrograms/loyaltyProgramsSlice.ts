import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// -------------------
// Types
// -------------------

export type DiscountType = "FREE_ITEM" | "DISCOUNT";

export interface LoyaltyRewardTier {
  id: string;
  programId: string;
  stampNumber: number;
  rewardType: DiscountType;
  rewardDescription?: string;
  discountAmount?: number | null;
  createdAt: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  rewardTiers: LoyaltyRewardTier[];
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyProgramState {
  program: LoyaltyProgram | null;
  loading: boolean;
  error: string | null;
}

// -------------------
// Async Thunks (API inlined)
// -------------------

export const fetchLoyaltyProgram = createAsyncThunk<LoyaltyProgram | null>(
  "loyaltyProgram/fetch",
  async () => {
    const res = await fetch("/api/loyalty-programs");
    if (!res.ok) throw new Error("Failed to fetch loyalty program");
    return res.json();
  }
);

export const createLoyaltyProgram = createAsyncThunk<
  LoyaltyProgram,
  { name: string; rewardTiers?: Partial<LoyaltyRewardTier>[] }
>("loyaltyProgram/create", async (data) => {
  const res = await fetch("/api/loyalty-programs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create loyalty program");
  return res.json();
});

export const updateLoyaltyProgram = createAsyncThunk<
  LoyaltyProgram,
  { name: string }
>("loyaltyProgram/update", async (data) => {
  const res = await fetch("/api/loyalty-programs", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update loyalty program");
  return res.json();
});

// -------------------
// Slice
// -------------------

const initialState: LoyaltyProgramState = {
  program: null,
  loading: false,
  error: null,
};

const loyaltyProgramSlice = createSlice({
  name: "loyaltyProgram",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchLoyaltyProgram.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLoyaltyProgram.fulfilled, (state, action) => {
      state.program = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchLoyaltyProgram.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch loyalty program";
    });

    // Create
    builder.addCase(createLoyaltyProgram.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createLoyaltyProgram.fulfilled, (state, action) => {
      state.program = action.payload;
      state.loading = false;
    });
    builder.addCase(createLoyaltyProgram.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to create loyalty program";
    });

    // Update
    builder.addCase(updateLoyaltyProgram.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateLoyaltyProgram.fulfilled, (state, action) => {
      state.program = action.payload;
      state.loading = false;
    });
    builder.addCase(updateLoyaltyProgram.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to update loyalty program";
    });
  },
});

export default loyaltyProgramSlice.reducer;
