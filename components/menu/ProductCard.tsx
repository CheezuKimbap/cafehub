"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { Kanit, Sora } from "next/font/google";

const kanit = Kanit({ subsets: ["latin"], weight: "400" });
const sora = Sora({ subsets: ["latin"], weight: "400" });
// import { AddToCartButton } from "./AddToCartButton";

type Props = {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
};

export function ProductCard({ id, name, description, price, imageUrl }: Props) {
  return (
    <Card className="flex flex-col justify-between hover:shadow-md transition bg-[#F4F4F4] shadow-sm">
      <CardHeader>
        <Link href={`/products/${id}`}>
          <img
            src={imageUrl ?? "/placeholder.png"}
            alt={name}
            className="w-full h-48 object-cover rounded-md"
          />
        </Link>
        <CardTitle className={`${kanit.className} mt-2 text-lg font-semibold`}>
          {name}
        </CardTitle>
        <div>
          <Star
            className="inline-block mr-1 mb-1"
            size={16}
            fill="#FF9736"
            color="#FF9736"
          />
          <span
            className={`${sora.className} text-sm text-[#FF9736] font-bold`}
          >
            4.9
          </span>
        </div>

        <p className={`${sora.className} text-default text-[#94664C]`}>
          P {price}
        </p>
      </CardHeader>

      <CardFooter className="flex justify-end gap-2">
        {/* <Link href={`/products/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            View
          </Button>
        </Link> */}
        {/* <AddToCartButton productId={id}> */}

        <div className="bg-[#94664C] rounded-full">
          <img src={"/bag.svg"} alt="Bag Icon" className="w-8 h-8 p-2" />
        </div>

        {/* </AddToCartButton> */}
      </CardFooter>
    </Card>
  );
}
