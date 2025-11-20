"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

interface Review {
    id: string;
    rating: number;
    comment: string;
    customer: {
        firstName: string | null;
        lastName: string | null;
        id: string;
    };
    customerId: string;
}

// Helper to get initials
const getInitials = (firstName?: string | null, lastName?: string | null) => {
    const f = firstName?.[0] ?? "";
    const l = lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "A";
};

// --- ReviewCard Component (Styled for the Image) ---
interface ReviewCardProps {
    review: Review;
    customerName: string;
    initials: string;
}

function ReviewCard({ review, customerName, initials, }: ReviewCardProps) {
    const filledStars = review.rating;

    return (
        <div
            className="
        flex flex-col p-6 bg-white rounded-xl shadow-lg
        w-full h-full // Ensures all cards take full height of the grid cell
        flex-grow
      "
            style={{ minHeight: '300px' }}
        >
            {/* Stars */}
            <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-6 h-6 ${i < filledStars
                            ? "fill-[#FFB800] text-[#FFB800]"
                            : "fill-gray-300 text-gray-300"
                            }`}
                    />
                ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-700 text-base italic mb-6 flex-grow">
                "{review.comment}"
            </p>

            {/* Customer Info */}
            <div className="flex items-center mt-auto">
                {/* Avatar Placeholder */}
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 bg-gray-200 border border-gray-300 flex items-center justify-center">
                    <span className="text-md font-semibold text-gray-600">{initials}</span>
                </div>
                <div>
                    <p className="text-base font-semibold text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-500">Customer</p>
                </div>
            </div>
        </div>
    );
}

// --- HomeReviews Component (Static 3-Card Grid for Alignment) ---
export function HomeReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState<Record<string, string>>({});

    useEffect(() => {
        // Fetch up to 3 reviews
        fetch("/api/reviews?latest=true&limit=3&filter=high")
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.message || "Failed to fetch reviews");
                }
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setReviews(data);
                } else {
                    setReviews([]);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch reviews:", err);
                setReviews([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


    if (loading) {
        return <p className="text-center text-gray-500">Loading reviews...</p>;
    }

    if (reviews.length === 0) {
        return <p className="text-center text-gray-500">No reviews yet.</p>;
    }

    const visibleReviews = reviews.slice(0, 3);


    return (
        <div
            className="
        w-full max-w-6xl mx-auto p-4
        grid grid-cols-1 // Stacked on small screens
        sm:grid-cols-2 // Two columns on small tablets
        lg:grid-cols-3 // Three columns on large screens
        gap-8 // Consistent spacing between cards pb-20
      "
        >
            {/* Map over only the visible reviews (max 3) */}
            {visibleReviews.map((r, i) => {
                const name =
                    r.customer?.firstName || r.customer?.lastName
                        ? `${r.customer?.firstName ?? ""} ${r.customer?.lastName ?? ""}`.trim()
                        : userNames[r.customerId] ?? "Anonymous Customer";

                const initials =
                    r.customer?.firstName || r.customer?.lastName
                        ? getInitials(r.customer?.firstName, r.customer?.lastName)
                        : getInitials(userNames[r.customerId] ?? name);


                return (
                    <ReviewCard
                        key={r.id}
                        review={r}
                        customerName={name}
                        initials={initials}
                    />
                );
            })}
        </div>
    );
}