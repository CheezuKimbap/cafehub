"use client";

import { useEffect, useState } from "react";
import {
    Clock,
    Utensils,
    Package,
    CheckCircle,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import {
    fetchOrders,
    updateOrderStatus,
    selectOrders,
    selectOrderStatus,
} from "@/redux/features/order/orderSlice";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OrderStatus, PaymentStatus } from "@/redux/features/order/order";
import { toast } from "sonner";

export default function BaristaBoard() {
    const dispatch = useAppDispatch();
    const orders = useAppSelector(selectOrders);
    const status = useAppSelector(selectOrderStatus);

    const [expandedCards, setExpandedCards] = useState<string[]>([]);
    const [expandedDetails, setExpandedDetails] = useState<string[]>([]);

    useEffect(() => {
        dispatch(fetchOrders());
    }, [dispatch]);

    useEffect(() => {
        setExpandedCards(
            orders.filter(o => o.status !== "COMPLETED").map(o => o.id)
        );
    }, [orders]);

    const toastAndUpdate = (
        id: string,
        status: OrderStatus,
        message: string,
        paymentStatus?: PaymentStatus
    ) => {
        toast.info(message);
        dispatch(updateOrderStatus({ id, status, paymentStatus }));
    };

    const toggleCard = (id: string) => {
        setExpandedCards(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const toggleDetails = (id: string) => {
        setExpandedDetails(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const isToday = (iso?: string) => {
        if (!iso) return false;
        const d = new Date(iso);
        const n = new Date();
        return (
            d.getFullYear() === n.getFullYear() &&
            d.getMonth() === n.getMonth() &&
            d.getDate() === n.getDate()
        );
    };

    const formatDateTime = (iso?: string) =>
        iso
            ? new Date(iso).toLocaleString([], {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "—";

    const columns: { key: OrderStatus; title: string }[] = [
        { key: "PENDING", title: "Pending" },
        { key: "PREPARING", title: "Preparing" },
        { key: "READYTOPICKUP", title: "Ready for Pickup" },
        { key: "COMPLETED", title: "Completed" },
    ];

    if (status === "loading")
        return <p className="p-4 text-gray-500">Loading orders...</p>;
    if (status === "failed")
        return <p className="p-4 text-red-500">Failed to load orders.</p>;

    return (
        <div className="grid grid-cols-4 gap-4">
            {columns.map(col => (
                <div key={col.key} className="space-y-4">
                    <h2
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border shadow-sm font-semibold uppercase text-sm
                        ${
                            col.key === "PENDING"
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : col.key === "PREPARING"
                                ? "bg-orange-200 text-orange-900 border-orange-400"
                                : col.key === "READYTOPICKUP"
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-800 border-gray-300"
                        }`}
                    >
                        {col.key === "PENDING" && <Clock className="w-4 h-4" />}
                        {col.key === "PREPARING" && <Utensils className="w-4 h-4" />}
                        {col.key === "READYTOPICKUP" && <Package className="w-4 h-4" />}
                        {col.key === "COMPLETED" && <CheckCircle className="w-4 h-4" />}
                        {col.title}
                    </h2>

                    {/* MAIN ORDERS */}
                    {orders
                        .filter(o =>
                            col.key === "COMPLETED"
                                ? o.status === "COMPLETED" &&
                                  o.paymentStatus === "PAID" &&
                                  isToday(o.orderDate)
                                : o.status === col.key
                        )
                        .sort((a, b) => {
                            if (col.key === "READYTOPICKUP") {
                                return (
                                    new Date(a.pickupTime ?? 0).getTime() -
                                    new Date(b.pickupTime ?? 0).getTime()
                                );
                            }
                            if (col.key === "PENDING" || col.key === "PREPARING") {
                                return (
                                    new Date(a.orderDate).getTime() -
                                    new Date(b.orderDate).getTime()
                                );
                            }
                            return (
                                new Date(b.orderDate).getTime() -
                                new Date(a.orderDate).getTime()
                            );
                        })
                        .map(order => {
                            const expanded = expandedCards.includes(order.id);
                            const detailsExpanded = expandedDetails.includes(order.id);

                            const showAll =
                                col.key === "PENDING" || col.key === "PREPARING";

                            const orderItems = showAll
                                ? order.orderItems
                                : detailsExpanded
                                ? order.orderItems
                                : order.orderItems.slice(0, 2);

                            return (
                                <Card key={order.id} className="shadow-md">
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>#{order.orderNumber}</span>
                                            <Badge
                                                className={
                                                    order.paymentStatus === "UNPAID"
                                                        ? "bg-red-100 text-red-700"
                                                        : "bg-green-100 text-green-700"
                                                }
                                            >
                                                {order.paymentStatus === "UNPAID"
                                                    ? "Unpaid"
                                                    : order.status}
                                            </Badge>
                                        </CardTitle>

                                        <p className="text-xs text-gray-500">
                                            Created: {formatDateTime(order.orderDate)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Scheduled Pickup:{" "}
                                            {order.pickupTime
                                                ? formatDateTime(order.pickupTime)
                                                : "—"}
                                        </p>
                                    </CardHeader>

                                    {expanded ? (
                                        <CardContent className="pt-3 space-y-2">
                                            {/* MARK AS PAID */}
                                            {order.paymentStatus === "UNPAID" && (
                                                <Button
                                                    onClick={() =>
                                                        toastAndUpdate(
                                                            order.id,
                                                            order.status,
                                                            "Marking as paid...",
                                                            "PAID"
                                                        )
                                                    }
                                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                                >
                                                    Mark as Paid
                                                </Button>
                                            )}

                                            {/* PENDING */}
                                            {order.status === "PENDING" && (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            toastAndUpdate(
                                                                order.id,
                                                                "PREPARING",
                                                                "Starting preparation..."
                                                            )
                                                        }
                                                        className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                                                    >
                                                        Start Preparing
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            toastAndUpdate(
                                                                order.id,
                                                                "CANCELLED",
                                                                "Cancelling order..."
                                                            )
                                                        }
                                                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        Cancel Order
                                                    </Button>
                                                </>
                                            )}

                                            {/* PREPARING */}
                                            {order.status === "PREPARING" && (
                                                <>
                                                    <Button
                                                        onClick={() =>
                                                            toastAndUpdate(
                                                                order.id,
                                                                "READYTOPICKUP",
                                                                "Marking ready..."
                                                            )
                                                        }
                                                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                                                    >
                                                        Mark Ready
                                                    </Button>
                                                    <Button
                                                        onClick={() =>
                                                            toastAndUpdate(
                                                                order.id,
                                                                "CANCELLED",
                                                                "Cancelling order..."
                                                            )
                                                        }
                                                        className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                    >
                                                        Cancel Order
                                                    </Button>
                                                </>
                                            )}

                                            {/* READY */}
                                            {order.status === "READYTOPICKUP" && (
                                                <Button
                                                    onClick={() =>
                                                        toastAndUpdate(
                                                            order.id,
                                                            "COMPLETED",
                                                            "Completing order..."
                                                        )
                                                    }
                                                    className="w-full border border-gray-300"
                                                    disabled={
                                                        order.paymentStatus === "UNPAID"
                                                    }
                                                >
                                                    Mark Picked Up
                                                </Button>
                                            )}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full mt-1"
                                                onClick={() => toggleCard(order.id)}
                                            >
                                                Collapse Card
                                            </Button>
                                        </CardContent>
                                    ) : (
                                        <CardContent className="pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => toggleCard(order.id)}
                                            >
                                                Expand Card
                                            </Button>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}

                    {/* CANCELLED TODAY — BELOW COMPLETED */}
                    {col.key === "COMPLETED" && (
                        <div className="pt-4 mt-4 border-t">
                            <h3 className="text-xs font-semibold uppercase text-gray-600 mb-3">
                                Cancelled Orders (Today)
                            </h3>

                            {orders
                                .filter(
                                    o =>
                                        o.status === "CANCELLED" &&
                                        isToday(o.orderDate)
                                )
                                .map(order => (
                                    <Card
                                        key={order.id}
                                        className="bg-red-50 border-red-200 shadow-sm"
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="flex justify-between text-sm">
                                                <span>#{order.orderNumber}</span>
                                                <Badge className="bg-red-200 text-red-800">
                                                    Cancelled
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>

                                        <CardContent>
                                            <Button
                                                size="sm"
                                                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                                onClick={() =>
                                                    toastAndUpdate(
                                                        order.id,
                                                        "PENDING",
                                                        "Reordering cancelled order...",
                                                        "UNPAID"
                                                    )
                                                }
                                            >
                                                Reorder
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
