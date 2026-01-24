"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Order } from "@/redux/features/order/order"; // adjust path
import { format } from "date-fns";

interface LatestOrdersCardProps {
  orders: Order[];
}

export function LatestOrdersCard({ orders }: LatestOrdersCardProps) {
  const peso = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="text-sm">
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
           {orders.length > 0 ? (
            orders
                .slice(0, 10)
                .map((order) => (
                <TableRow key={order.id}>
                  {/* Show first product (or join names if multiple) */}

                  <TableCell className="font-medium">{order.orderNumber}</TableCell>

                  <TableCell>
                    {format(new Date(order.orderDate), "MMM dd, yyyy")}
                  </TableCell>

                  <TableCell>
                    {order.customer?.firstName} {order.customer?.lastName ?? ""}
                  </TableCell>

                  <TableCell>
                    <Badge
                      className={
                        order.status === "COMPLETED"
                          ? "bg-green-500 text-white"
                          : order.status === "PENDING"
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-300 text-black"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {order.paymentMethod?.type}
                    {order.paymentStatus === "PAID" ? (
                      <Badge className="ml-2 bg-green-500 text-white">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="ml-2 bg-red-500 text-white">
                        Unpaid
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    {peso.format(order.totalAmount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-6 text-gray-500"
                >
                  No orders yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
