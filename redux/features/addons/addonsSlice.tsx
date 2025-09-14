// redux/features/addons/addonsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAddons = createAsyncThunk("addons/fetchAddons", async () => {
  const res = await fetch("/api/addons");
  if (!res.ok) throw new Error("Failed to fetch addons");
  return await res.json();
});

const addonsSlice = createSlice({
  name: "addons",
  initialState: { list: [], loading: false, error: null } as {
    list: { id: string; name: string; price: number }[];
    loading: boolean;
    error: string | null;
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddons.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAddons.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchAddons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load addons";
      });
  },
});

export default addonsSlice.reducer;
