"use client";

import { useState, useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
  fetchReviews,
  addReview,
  selectReviews,
} from "@/redux/features/reviews/reviewSlice";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ProductReviewsProps {
  productId: string;
  customerId?: string;
}

// helper to get initials from first & last name
const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "A";
};

const RatingStars = ({
  rating,
  onSelect,
}: {
  rating: number;
  onSelect?: (v: number) => void;
}) => (
  <div className="flex gap-1 my-2">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star
        key={i}
        size={22}
        fill={i <= rating ? "#FFC700" : "none"}
        stroke={i <= rating ? "#FFC700" : "#D4D4D8"}
        className={onSelect ? "cursor-pointer" : ""}
        onClick={() => onSelect?.(i)}
      />
    ))}
  </div>
);

const formatDate = (createdAt: string) => {
  const now = new Date();
  const date = new Date(createdAt);
  const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 1) return "Today";
  if (diff < 7) return `${Math.floor(diff)} days ago`;
  return date.toLocaleDateString();
};

export function ProductReviews({ productId, customerId }: ProductReviewsProps) {
  const dispatch = useAppDispatch();
  const { items: reviews, loading } = useAppSelector(selectReviews);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [canReview, setCanReview] = useState(false); // ✅ New state

  useEffect(() => {
    dispatch(fetchReviews(productId));
  }, [dispatch, productId]);

  // fetch user names for reviews where customer name is missing
  useEffect(() => {
    reviews.forEach((r) => {
      const hasName = r.customer?.firstName || r.customer?.lastName;
      if (!hasName && r.customerId && !userNames[r.customerId]) {
        fetch(`/api/user/getName?customerId=${r.customerId}`)
          .then((res) => res.json())
          .then((data: { name: string }) => {
            setUserNames((prev) => ({
              ...prev,
              [r.customerId]: data.name || "Anonymous",
            }));
          })
          .catch(() =>
            setUserNames((prev) => ({ ...prev, [r.customerId]: "Anonymous" })),
          );
      }
    });
  }, [reviews, userNames]);

  // ✅ Check if customer can review
  useEffect(() => {
    if (!customerId) return;
    fetch(
      `/api/reviews/canReview?customerId=${customerId}&productId=${productId}`
    )
      .then((res) => res.json())
      .then((data: { canReview: boolean }) => setCanReview(data.canReview))
      .catch(() => setCanReview(false));
  }, [customerId, productId]);

  const summary = useMemo(() => {
    if (reviews.length === 0)
      return { avg: 0, total: 0, counts: {} as Record<number, number> };

    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => counts[r.rating]++);
    const total = reviews.length;
    const avg = Number(
      (reviews.reduce((a, b) => a + b.rating, 0) / total).toFixed(1)
    );
    return { avg, total, counts };
  }, [reviews]);

  const handleSubmit = () => {
    if (!customerId) return alert("You must be logged in to submit a review.");
    if (!rating) return alert("Please select a rating.");
    if (!comment.trim()) return alert("Comment is required.");

    dispatch(addReview({ productId, customerId, rating, comment }));
    setRating(0);
    setComment("");
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Customer Reviews</h2>

        {/* ✅ Only show write button if logged in AND can review */}
        {customerId && canReview && (
          <Button onClick={() => setShowForm(true)}>Write a Review</Button>
        )}
      </div>

      {/* Summary */}
      <div className="flex items-center gap-6 border-b pb-5 mb-5">
        <div className="text-center">
          <p className="text-4xl font-bold">{summary.avg.toFixed(1)}</p>
          <RatingStars rating={Math.round(summary.avg)} />
          <p className="text-sm text-gray-500">{summary.total} reviews</p>
        </div>

        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const percentage = summary.total
              ? Math.round((summary.counts[star] / summary.total) * 100)
              : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-sm">
                <span className="w-2">{star}</span>
                <Star size={14} />
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${percentage}%` }}
                    className="h-full bg-yellow-400"
                  />
                </div>
                <span className="w-8 text-right">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {customerId && canReview && showForm && (
        <div className="mb-5 p-4 border rounded-lg bg-gray-50">
          <RatingStars rating={rating} onSelect={setRating} />
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="my-3"
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit}>Submit</Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Message if cannot review */}
      {customerId && !canReview && (
        <p className="text-sm text-gray-500 my-4">
          You can only review this product after purchasing it.
        </p>
      )}

      {/* Review List */}
      {loading && <p className="text-center text-gray-500">Loading...</p>}
      {!loading && reviews.length === 0 && (
        <p className="text-center text-gray-500">No reviews yet.</p>
      )}

      <div className="space-y-5">
        {reviews.map((r) => {
          const name =
            r.customer?.firstName || r.customer?.lastName
              ? `${r.customer?.firstName ?? ""} ${r.customer?.lastName ?? ""}`.trim()
              : userNames[r.customerId] ?? "Anonymous";

          const initials =
            r.customer?.firstName || r.customer?.lastName
              ? getInitials(r.customer?.firstName, r.customer?.lastName)
              : getInitials(userNames[r.customerId] ?? "Anonymous");

          return (
            <div key={r.id} className="border-b pb-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold">
                    {initials}
                  </div>
                  {name}
                </span>
                <span className="text-xs text-gray-500">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              <RatingStars rating={r.rating} />
              <p className="text-gray-700 mt-2">{r.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
