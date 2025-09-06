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

interface LatestOrdersCardProps {
  orders: Order[];
}

export function LatestOrdersCard({ orders }: LatestOrdersCardProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Latest Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  {new Date(order.orderDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{order.customerId}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      order.status === "COMPLETED"
                        ? "default"
                        : order.status === "PENDING"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {order.paymentMethod?.type}{" "}
                  {order.paymentStatus === "PAID" ? (
                    <Badge className="ml-2" variant="success">
                      Paid
                    </Badge>
                  ) : (
                    <Badge className="ml-2" variant="destructive">
                      Unpaid
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  ₱{order.totalAmount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
