"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

export function EmptyCart() {
  const router = useRouter();

  return (
    <Card className="max-w-md mx-auto mt-20 text-center shadow-lg ">
      <CardHeader>
        <ShoppingCart className="mx-auto mb-4 w-12 h-12 text-gray-400" />
        <CardTitle>Your Cart is Empty</CardTitle>
        <CardDescription>
          Looks like you haven't added anything to your cart yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push("/menu")}
        >
          Shop Now
        </Button>
      </CardContent>
    </Card>
  );
}
