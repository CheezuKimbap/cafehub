"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrdersByCustomerId } from "@/redux/features/order/orderSlice";
import {
  selectOrders,
  selectOrderStatus,
} from "@/redux/features/order/orderSlice";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface CustomerOrdersProps {
  customerId: string;
}

const CustomerOrders: React.FC<CustomerOrdersProps> = ({ customerId }) => {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const status = useAppSelector(selectOrderStatus);

  useEffect(() => {
    if (customerId) dispatch(fetchOrdersByCustomerId({ customerId }));
  }, [dispatch, customerId]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-4 text-center">No orders found for this customer.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>
                {new Date(order.orderDate).toLocaleDateString()}
              </TableCell>
              <TableCell>${order.totalAmount.toLocaleString()}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.paymentStatus}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerOrders;
