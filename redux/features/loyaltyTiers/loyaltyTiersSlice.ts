import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// -------------------
// Types
// -------------------

export type DiscountType = "FREE_ITEM" | "PERCENTAGE_OFF";

export interface LoyaltyRewardTier {
  id: string;
  programId: string;
  stampNumber: number;
  rewardType: DiscountType;
  rewardDescription?: string;
  discountAmount?: number | null;
  createdAt: string;
}

export interface LoyaltyRewardTiersState {
  list: LoyaltyRewardTier[];
  loading: boolean;
  error: string | null;
}

// -------------------
// Async Thunks
// -------------------

// Fetch all tiers
export const fetchAllTiers = createAsyncThunk<LoyaltyRewardTier[]>(
  "loyaltyRewardTier/fetchAll",
  async () => {
    const res = await fetch("/api/loyalty-reward-tiers");
    if (!res.ok) throw new Error("Failed to fetch tiers");
    return res.json();
  }
);

// Add a new tier
export const addTier = createAsyncThunk<LoyaltyRewardTier, Partial<LoyaltyRewardTier>>(
  "loyaltyRewardTier/add",
  async (tier) => {
    const res = await fetch("/api/loyalty-reward-tiers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tier),
    });
    if (!res.ok) throw new Error("Failed to add tier");
    return res.json();
  }
);

// Update a tier
export const updateTier = createAsyncThunk<
  LoyaltyRewardTier,
  { id: string; data: Partial<LoyaltyRewardTier> }
>("loyaltyRewardTier/update", async ({ id, data }) => {
  const res = await fetch(`/api/loyalty-reward-tiers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update tier");
  return res.json();
});

// Delete a tier
export const deleteTier = createAsyncThunk<string, string>(
  "loyaltyRewardTier/delete",
  async (id) => {
    const res = await fetch(`/api/loyalty-reward-tiers/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete tier");
    return id;
  }
);

// -------------------
// Slice
// -------------------

const initialState: LoyaltyRewardTiersState = {
  list: [],
  loading: false,
  error: null,
};

const loyaltyRewardTierSlice = createSlice({
  name: "loyaltyRewardTier",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch all
    builder.addCase(fetchAllTiers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchAllTiers.fulfilled, (state, action: PayloadAction<LoyaltyRewardTier[]>) => {
      state.list = action.payload;
      state.loading = false;
    });
    builder.addCase(fetchAllTiers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch tiers";
    });

    // Add tier
    builder.addCase(addTier.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addTier.fulfilled, (state, action: PayloadAction<LoyaltyRewardTier>) => {
      state.list.push(action.payload);
      state.loading = false;
    });
    builder.addCase(addTier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to add tier";
    });

    // Update tier
    builder.addCase(updateTier.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateTier.fulfilled, (state, action: PayloadAction<LoyaltyRewardTier>) => {
      const idx = state.list.findIndex((t) => t.id === action.payload.id);
      if (idx >= 0) state.list[idx] = action.payload;
      state.loading = false;
    });
    builder.addCase(updateTier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to update tier";
    });

    // Delete tier
    builder.addCase(deleteTier.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteTier.fulfilled, (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((t) => t.id !== action.payload);
      state.loading = false;
    });
    builder.addCase(deleteTier.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to delete tier";
    });
  },
});

export default loyaltyRewardTierSlice.reducer;
