"use client";

import { useEffect, useState } from "react";
import { Star, MoveLeft, MoveRight } from "lucide-react";

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

interface UserNameResponse {
  name: string;
}

const getInitials = (firstName?: string | null, lastName?: string | null) => {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "A";
};

export function HomeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

    useEffect(() => {
    fetch("/api/reviews?latest=true&limit=5")
        .then(async (res) => {
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
        }
        return res.json();
        })
        .then((data) => {
        if (Array.isArray(data)) {
            setReviews(data);
        } else {
            console.error("Unexpected response format:", data);
            setReviews([]);
        }
        })
        .catch((err) => {
        console.error("Failed to fetch reviews:", err);
        setReviews([]);
        });
    }, []);



  const prev = () =>
    setIndex((i) => (reviews.length > 0 ? (i > 0 ? i - 1 : reviews.length - 1) : 0));
  const next = () =>
    setIndex((i) => (reviews.length > 0 ? (i < reviews.length - 1 ? i + 1 : 0) : 0));

  if (reviews.length === 0)
    return <p className="text-white text-center">No reviews yet</p>;

  const r = reviews[index];
  if (!r) return null; //
  const name =
    r.customer?.firstName || r.customer?.lastName
      ? `${r.customer?.firstName ?? ""} ${r.customer?.lastName ?? ""}`.trim()
      : userNames[r.customerId] ?? "Anonymous";

  const initials =
    r.customer?.firstName || r.customer?.lastName
      ? getInitials(r.customer?.firstName, r.customer?.lastName)
      : getInitials(userNames[r.customerId] ?? "Anonymous");

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <button
        onClick={prev}
        className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-2"
      >
        <MoveLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <div className="bg-[#A78868] w-full sm:w-8/12 text-center p-6 rounded-lg relative">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border-4 border-[#A78868] mx-auto mt-12 flex items-center justify-center text-lg sm:text-xl font-bold text-gray-700">
          {initials}
        </div>

        <p className="mt-4 font-bold text-white">{name}</p>
        <div className="flex justify-center mt-2 mb-4 space-x-1">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Star
                key={i}
                className={`inline w-4 h-4 sm:w-5 sm:h-5 ${
                  i < r.rating
                    ? "fill-yellow-500 text-yellow-500"
                    : "fill-gray-300 text-gray-300"
                }`}
              />
            ))}
        </div>
        <p className="text-white text-sm sm:text-base px-4 sm:px-12">
          {r.comment}
        </p>
      </div>

      <button
        onClick={next}
        className="px-4 bg-[#A78868] rounded-lg cursor-pointer border-black border-2"
      >
        <MoveRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>
    </div>
  );
}
