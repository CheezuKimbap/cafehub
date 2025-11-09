// redux/features/reviews/reviewSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  createdAt: string,
  updateAt: string,
  rating: number;
  comment?: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewState {
  items: Review[];
  loading: boolean;
  error: string | null;
}

const initialState: ReviewState = {
  items: [],
  loading: false,
  error: null,
};

// -----------------
// Async Thunks
// -----------------
export const fetchReviews = createAsyncThunk<
  Review[],
  string,
  { rejectValue: string }
>("reviews/fetchReviews", async (productId, { rejectWithValue }) => {
  try {
    const res = await fetch(`/api/reviews?productId=${productId}`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const data = await res.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addReview = createAsyncThunk<
  Review,
  { productId: string; customerId: string; rating: number; comment?: string },
  { rejectValue: string }
>("reviews/addReview", async (reviewData, { rejectWithValue }) => {
  try {
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewData),
    });
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Failed to add review");
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// -----------------
// Slice
// -----------------
const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {
    clearReviews(state) {
      state.items = [];
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Reviews
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action: PayloadAction<Review[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch reviews";
      })
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action: PayloadAction<Review>) => {
        state.loading = false;
        state.items.unshift(action.payload); // add new review at top
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add review";
      });
  },
});

export const { clearReviews } = reviewSlice.actions;
export const selectReviews = (state: RootState) => state.reviews;

export default reviewSlice.reducer;
