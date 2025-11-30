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
import type { Order, OrderStatus, PaymentStatus } from "@/redux/features/order/order";

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
        const defaultExpanded = orders
            .filter((o) => o.status !== "COMPLETED")
            .map((o) => o.id);
        setExpandedCards(defaultExpanded);
    }, [orders]);

    const handleUpdateStatus = (
        id: string,
        next: OrderStatus,
        paymentStatus?: PaymentStatus
    ) => {
        dispatch(updateOrderStatus({ id, status: next, paymentStatus }));
    };

    const toggleCard = (id: string) => {
        setExpandedCards((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    const toggleDetails = (id: string) => {
        setExpandedDetails((prev) =>
            prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
        );
    };

    const columns: { key: OrderStatus; title: string }[] = [
        { key: "PENDING", title: "Pending" },
        { key: "PREPARING", title: "Preparing" },
        { key: "READYTOPICKUP", title: "Ready for Pickup" },
        { key: "COMPLETED", title: "Completed" },
    ];

    const formatDateTime = (iso?: string) => {
        if (!iso) return null;
        const date = new Date(iso);
        return date.toLocaleString([], {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (status === "loading")
        return <p className="p-4 text-gray-500">Loading orders...</p>;
    if (status === "failed")
        return <p className="p-4 text-red-500">Failed to load orders.</p>;

    return (
        <div className="grid grid-cols-4 gap-4">
            {columns.map((col) => (
                <div key={col.key} className="space-y-4">
                    <h2
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border shadow-sm font-semibold uppercase text-sm tracking-wide
              ${col.key === "PENDING"
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

                    {orders
                        .filter((o) => {
                            if (col.key === "COMPLETED") {
                                const orderDate = new Date(o.orderDate);
                                const now = new Date();
                                return (
                                    o.status === "COMPLETED" &&
                                    o.paymentStatus === "PAID" &&
                                    orderDate.getFullYear() === now.getFullYear() &&
                                    orderDate.getMonth() === now.getMonth() &&
                                    orderDate.getDate() === now.getDate()
                                );
                            }
                            return o.status === col.key;
                        })
                        .sort((a, b) => {
                            if (col.key === "READYTOPICKUP") {
                                const pickupA = a.pickupTime ? new Date(a.pickupTime).getTime() : 0;
                                const pickupB = b.pickupTime ? new Date(b.pickupTime).getTime() : 0;
                                return pickupA - pickupB;
                            } else if (col.key === "PENDING" || col.key === "PREPARING") {
                                return new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
                            } else {
                                return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
                            }
                        })

                        .map((order) => {
                            const cardExpanded = expandedCards.includes(order.id);
                            const detailsExpanded = expandedDetails.includes(order.id);

                            const showAllItems = col.key === "PENDING" || col.key === "PREPARING";
                            const orderItems = showAllItems
                                ? order.orderItems
                                : detailsExpanded
                                    ? order.orderItems
                                    : order.orderItems.slice(0, 2);

                            // === PRICE CALCULATION ===
                            const subtotal = order.orderItems.reduce((sum, item) => {
                                const base = item.priceAtPurchase * item.quantity;
                                const addons = item.addons.reduce(
                                    (aSum, a) => aSum + a.addon.price * a.quantity,
                                    0
                                );
                                return sum + base + addons;
                            }, 0);

                            const discount = order.discountApplied ?? 0;
                            const finalTotal = subtotal - discount;

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
                                            Scheduled Pickup: {order.pickupTime
                                                ? formatDateTime(order.pickupTime)
                                                : "—"}
                                        </p>
                                    </CardHeader>

                                    {cardExpanded ? (
                                        <CardContent className="pt-3 space-y-2">
                                            <p className="font-medium text-sm text-gray-800">
                                                Customer Name: {order.orderName ?? order.customer?.firstName}
                                            </p>

                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {orderItems.map((item) => {
                                                    const itemTotal =
                                                        item.priceAtPurchase * item.quantity +
                                                        item.addons.reduce(
                                                            (sum, a) => sum + a.addon.price * a.quantity,
                                                            0
                                                        );
                                                    return (
                                                        <li
                                                            key={item.id}
                                                            className={`flex flex-col p-1 rounded-md ${item.addons.length > 0 ? "bg-yellow-50" : ""
                                                                }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <span>
                                                                    {item.quantity}× {item.variant?.product?.name ?? "Unknown Product"} (₱
                                                                    {item.priceAtPurchase.toFixed(2)}) - {item.variant?.servingType ?? ""}
                                                                </span>
                                                                <span>₱{itemTotal.toFixed(2)}</span>
                                                            </div>

                                                            {item.addons.length > 0 && (
                                                                <ul className="pl-4 text-xs text-gray-500 mt-1 space-y-0.5">
                                                                    {item.addons.map((a) => (
                                                                        <li key={a.id}>
                                                                            {a.addon.name} × {a.quantity} (₱
                                                                            {(a.addon.price * a.quantity).toFixed(2)})
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </li>
                                                    );
                                                })}
                                            </ul>

                                            {order.orderItems.length > 2 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="flex items-center gap-1 mt-1"
                                                    onClick={() => toggleDetails(order.id)}
                                                >
                                                    {detailsExpanded ? (
                                                        <>
                                                            Collapse Details <ChevronUp className="w-3 h-3" />
                                                        </>
                                                    ) : (
                                                        <>
                                                            Show Details <ChevronDown className="w-3 h-3" />
                                                        </>
                                                    )}
                                                </Button>
                                            )}



                                            {/* === PRICE DISPLAY === */}
                                            <div className="pt-2 text-sm">
                                                <p className="text-gray-700">
                                                    Subtotal: <span className="font-semibold">₱{subtotal.toFixed(2)}</span>
                                                </p>

                                                {discount > 0 && (
                                                    <p className="text-green-700">
                                                        Discount: <span className="font-semibold">-₱{discount.toFixed(2)}</span>
                                                    </p>
                                                )}

                                                <p className="font-semibold text-gray-900 mt-1">
                                                    Total: ₱{finalTotal.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="pt-2 space-y-2">
                                                {order.paymentStatus === "UNPAID" && (
                                                    <Button
                                                        onClick={() =>
                                                            handleUpdateStatus(order.id, order.status, "PAID")
                                                        }
                                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                                                    >
                                                        Mark as Paid
                                                    </Button>
                                                )}

                                                {order.status === "PENDING" && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(order.id, "PREPARING")}
                                                            className="w-full bg-orange-400 hover:bg-orange-500 text-white"
                                                        >
                                                            Start Preparing
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    </>
                                                )}

                                                {order.status === "PREPARING" && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(order.id, "READYTOPICKUP")}
                                                            className="w-full bg-green-500 hover:bg-green-600 text-white"
                                                        >
                                                            Mark Ready
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleUpdateStatus(order.id, "CANCELLED")}
                                                            className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                        >
                                                            Cancel Order
                                                        </Button>
                                                    </>
                                                )}

                                                {order.status === "READYTOPICKUP" && (
                                                    <Button
                                                        onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                                                        className="w-full border border-gray-300 text-white hover:bg-gray-50"
                                                        disabled={order.paymentStatus === "UNPAID"}
                                                        title={order.paymentStatus === "UNPAID" ? "Cannot pick up unpaid orders" : ""}
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
                                                    {cardExpanded ? "Collapse Card" : "Expand Card"}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    ) : (
                                        <CardContent className="pt-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full flex items-center justify-center gap-1"
                                                onClick={() => toggleCard(order.id)}
                                            >
                                                Expand Card <ChevronDown className="w-3 h-3" />
                                            </Button>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                </div>
            ))}
        </div>
    );
}
