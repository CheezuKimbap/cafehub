"use client";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Kanit, Sora } from "next/font/google";
import { useState } from "react";

const kanit = Kanit({ subsets: ["latin"], weight: "400" });
const sora = Sora({ subsets: ["latin"], weight: "400" });

type Props = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

const FALLBACK_IMAGE =
  "https://res.cloudinary.com/du4kqqco7/image/upload/v1759020948/cihjvxbuf7tzbxwwfyp7.png";

export function ProductCard({ id, name, price, imageUrl }: Props) {
  const [imgSrc, setImgSrc] = useState(imageUrl || FALLBACK_IMAGE);

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
        <CardHeader className="flex flex-col  p-2 sm:p-4">
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

          {/* Rating */}
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
              4.9
            </span>
          </div>

          {/* Price */}
          <p
            className={`${sora.className} text-xs sm:text-sm md:text-base text-[#94664C]`}
          >
            P {price}
          </p>
        </CardHeader>
      </Card>
    </Link>
  );
}
