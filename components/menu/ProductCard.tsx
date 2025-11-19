"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Kanit, Sora } from "next/font/google";
import { useState, useMemo } from "react"; // 👈 Added useMemo for price calculation
import { ProductVariant } from "@/redux/features/products/product";
import hotIcon from "@/public/hot.svg";
import coldIcon from "@/public/cold.svg";
const kanit = Kanit({ subsets: ["latin"], weight: "400" });
const sora = Sora({ subsets: ["latin"], weight: "400" });

type Props = {
    id: string;
    name: string;
    description?: string;
    variants: ProductVariant[];
    imageUrl?: string;
    rating?: number;
    hasPrice?: boolean;
    hasRating?: boolean;
    hasDescription?: boolean;
    hasCompactPrice?: boolean; // 👈 New prop for compact price display
};


const FALLBACK_IMAGE =
    "https://res.cloudinary.com/du4kqqco7/image/upload/v1759020948/cihjvxbuf7tzbxwwfyp7.png";

export function ProductCard({
    id,
    name,
    description,
    variants,
    imageUrl,
    rating,
    hasPrice = false,
    hasRating = true,
    hasDescription = false,
    hasCompactPrice = false, // 👈 Default to false
}: Props) {
    const [imgSrc, setImgSrc] = useState(imageUrl || FALLBACK_IMAGE);

    // 👈 New: Calculate the lowest price for compact display
    const lowestPrice = useMemo(() => {
        if (!variants || variants.length === 0) return null;
        const prices = variants.map(v => v.price);
        return Math.min(...prices);
    }, [variants]);

    return (
        <Link href={`/menu/${id}`} className="">
            <Card
                className="
          flex flex-col justify-between
          hover:shadow-md transition
          bg-[#F4F4F4]
          min-w-[130px] min-h-[200px] h-full py-0
        "
            >
                <CardHeader className="flex flex-col  p-2 sm:p-4">
                    {/* Image fills width of card */}
                    <div className="relative w-full aspect-square">
                        <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                            className="rounded-lg object-cover"
                            onError={() => setImgSrc(FALLBACK_IMAGE)}
                        />
                    </div>

                    {/* Product name */}
                    <CardTitle
                        className={`${kanit.className} text-left text-xs sm:text-base md:text-md font-semibold `}
                    >
                        {name}
                    </CardTitle>

                    {hasDescription && description && (
                        <p
                            className={`${sora.className} text-left text-xs sm:text-sm md:text-sm text-gray-600`}
                        >
                            {description.length > 60 ? `${description.slice(0, 60)}...` : description}
                        </p>
                    )}


                    {/* Rating */}
                    {hasRating && (
                        <div className="flex items-center justify-center gap-1">
                            <Star
                                size={14}
                                className="sm:w-4 sm:h-4"
                                fill="#FF9736"
                                color="#FF9736"
                            />
                            <span
                                className={`${sora.className} text-xs sm:text-sm md:text-base text-[#FF9736] font-bold`}
                            >
                                {rating ?? 0}
                            </span>
                        </div>)}

                    {/* New Compact Price Display */}
                    {hasCompactPrice && lowestPrice !== null && (
                        <div className="mt-2 flex justify-center">
                            <span
                                className={`${kanit.className} text-lg font-bold text-gray-900`}
                            >
                                ₱{lowestPrice.toFixed(2)}
                            </span>
                        </div>
                    )}

                    {hasPrice && (
                        <div className="mt-2 space-y-1">
                            {variants.map((variant) => {
                                const iconSrc =
                                    variant.servingType.toUpperCase() === "HOT"
                                        ? hotIcon
                                        : variant.servingType.toUpperCase() === "COLD"
                                            ? coldIcon
                                            : null;

                                return (
                                    <div
                                        key={variant.id}
                                        className="flex justify-between items-center text-sm py-1 w-full"
                                    >
                                        {/* Left side: icon + serving type */}
                                        <div className="flex  gap-2">
                                            {iconSrc && (
                                                <div className="w-4 h-4 relative">
                                                    <Image src={iconSrc} alt={variant.servingType} fill />
                                                </div>
                                            )}
                                            {variant.servingType}
                                            {variant.size ? ` - ${variant.size}` : ""}
                                        </div>
                                        <div>
                                              ₱{variant.price}
                                        </div>

                                        {/* Right side: just text, no extra flex/span */}

                                    </div>
                                );
                            })}
                        </div>
                    )}





                </CardHeader>
            </Card>
        </Link>
    );
}