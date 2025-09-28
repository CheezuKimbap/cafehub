import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Customer, Profile, User } from './profile';

// -------------------------
// Types
// -------------------------
interface ProfileState {
  loading: boolean;
  error: string | null;
  user: User | null;
  customer: Customer | null;
  profile: Profile | null;
}

// -------------------------
// Initial State
// -------------------------
const initialState: ProfileState = {
  loading: false,
  error: null,
  user: null,
  customer: null,
  profile: null,
};

// -------------------------
// Async Thunk: update profile
// -------------------------
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (
    payload: {
      customerId: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phoneNumber?: string;
      preferences?: string;
      address?: string;
      image?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');
      return data;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// -------------------------
// Slice
// -------------------------
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.customer = null;
      state.profile = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.customer = action.payload.customer;
        state.profile = action.payload.profile;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
