"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hook";
import { fetchOrdersByCustomerId } from "@/redux/features/order/orderSlice";
import { useSession } from "next-auth/react";
import { Coffee, Package, Inbox } from "lucide-react";
import {
  Order,
  OrderItemAddon,
  OrderStatus,
} from "@/redux/features/order/order";

// Timeline stages (no CANCELLED)
const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "READYTOPICKUP",
  "COMPLETED",
] as const;

// Icons for stages
const STATUS_ICONS: Record<OrderStatus, React.ReactNode> = {
  PENDING: <Inbox className="w-5 h-5" />,
  PREPARING: <Coffee className="w-5 h-5" />,
  READYTOPICKUP: <Package className="w-5 h-5" />,
  COMPLETED: <Package className="w-5 h-5" />,
  CANCELLED: <Package className="w-5 h-5" />, // not used in timeline
};

const statusMessages: Record<
  OrderStatus,
  { title: string; description: string }
> = {
  PENDING: {
    title: "Order received",
    description: "We have received your order. Preparing soon.",
  },
  PREPARING: {
    title: "Being prepared",
    description: "Our barista is carefully crafting your coffee.",
  },
  READYTOPICKUP: {
    title: "Ready for pickup",
    description: "Your order is ready. Please pick it up at the counter.",
  },
  COMPLETED: {
    title: "Completed",
    description: "Thank you! Your order is complete.",
  },
  CANCELLED: { title: "Cancelled", description: "This order was cancelled." },
};

// Pesos formatter
const formatPeso = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    amount,
  );

export default function OrdersPage() {
  const dispatch = useAppDispatch();
  const { orders, status, error } = useAppSelector((state) => state.order);
  const { data: session, status: authStatus } = useSession();

  useEffect(() => {
    if (authStatus === "authenticated" && session?.user?.customerId) {
      dispatch(
        fetchOrdersByCustomerId({ customerId: session.user.customerId }),
      );
    }
  }, [dispatch, session, authStatus]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20 space-y-2">
      <div className="w-12 h-12 border-4 border-t-orange-500 border-gray-200 rounded-full animate-spin"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (authStatus === "loading") return <LoadingSpinner />;
  if (!session)
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-500">Please sign in to see your orders.</p>
      </div>
    );
  if (status === "loading") return <LoadingSpinner />;
  if (status === "failed")
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      {orders.length === 0 ? (
        <p className="text-gray-500">You have no orders yet.</p>
      ) : (
        [...orders]
        .sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime())
        .map((order) => {
          const isCancelled = order.status === "CANCELLED";
          // Only mark COMPLETED if status COMPLETED and payment PAID
          const activeIndex =
            order.status === "COMPLETED" && order.paymentStatus === "PAID"
              ? STATUS_ORDER.indexOf("COMPLETED")
              : STATUS_ORDER.indexOf(order.status as OrderStatus);

          const itemsTotal = order.orderItems.reduce(
            (acc, item) => acc + item.priceAtPurchase * item.quantity,
            0,
          );
          const addonsTotal = order.orderItems.reduce(
            (acc, item) =>
              acc +
              item.addons.reduce(
                (a, addon) =>
                  a + addon.addon.price * addon.quantity * item.quantity,
                0,
              ),
            0,
          );
          const discount = order.discountApplied || 0;
          const subtotal = itemsTotal + addonsTotal;
          const total = subtotal - discount;

          return (
            <div
              key={order.id}
              className="border rounded-lg p-6 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white"
            >
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-lg">
                    Order #{order.orderNumber}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isCancelled
                        ? "bg-red-100 text-red-700"
                        : order.status === "COMPLETED" &&
                          order.paymentStatus === "PAID"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {isCancelled
                      ? "Cancelled"
                      : order.status === "COMPLETED" && order.paymentStatus === "PAID"
                      ? "Completed"
                      : "In Progress"}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Placed on {new Date(order.orderDate).toLocaleString()}
                </p>

                {/* Timeline */}
                <div className="flex items-center space-x-2">
                  {STATUS_ORDER.map((status, idx) => {
                    const activeOrCompleted = idx <= activeIndex; // only active or completed is colored
                    return (
                      <div key={status} className="flex items-center w-full relative">
                        <div
                          className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                            activeOrCompleted
                              ? "bg-orange-500 border-orange-500 text-white"
                              : "bg-white border-gray-300 text-gray-400"
                          }`}
                        >
                          {STATUS_ICONS[status]}
                        </div>
                        {idx < STATUS_ORDER.length - 1 && (
                          <div
                            className={`flex-1 h-1 ${
                              idx < activeIndex ? "bg-orange-500" : "bg-gray-300"
                            }`}
                          ></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Description */}
                {!isCancelled && (
                  <div className="bg-orange-50 p-4 rounded-lg flex items-start space-x-3">
                    <Coffee className="text-orange-500 w-5 h-5 mt-1" />
                    <div>
                      <p className="text-sm font-medium">
                        {
                          statusMessages[order.status as OrderStatus].title
                        }
                      </p>
                      <p className="text-xs text-gray-600">
                        {
                          statusMessages[order.status as OrderStatus].description
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Items */}
                <ul className="border-t pt-2 space-y-2">
                  {order.orderItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex flex-col space-y-1 border-b py-2"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">
                            {item.variant?.product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.variant?.servingType ?? ""} - Qty:{" "}
                            {item.quantity} ({formatPeso(item.variant.price)} each)
                          </p>
                        </div>
                        <span className="font-medium">
                          {formatPeso(item.priceAtPurchase)}
                        </span>
                      </div>
                      {item.addons.length > 0 && (
                        <ul className="ml-4 space-y-1">
                          {item.addons.map((addon: OrderItemAddon) => (
                            <li
                              key={addon.id}
                              className="flex justify-between text-xs text-gray-500"
                            >
                              <span>
                                + {addon.addon.name} x{" "}
                                {addon.quantity * item.quantity} (
                                {formatPeso(addon.addon.price)} each)
                              </span>
                              <span>
                                {formatPeso(
                                  addon.addon.price * addon.quantity * item.quantity,
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right Column: Summary */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-semibold">Order For</h3>
                  <p>
                    {order.customer.firstName} {order.customer.lastName}

                  </p>
                  {order.paymentMethod?.type && (
                    <p className="text-xs text-gray-500">
                      Paid with {order.paymentMethod.type}{" "}
                      {order.paymentMethod.details
                        ? `• ${order.paymentMethod.details}`
                        : ""}
                    </p>
                  )}
                </div>

                <div className="border rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-semibold">Pickup Time</h3>
                  <p>
                    Scheduled Pickup:{" "}
                    {(() => {
                        const orderDate = new Date(order.orderDate);
                        const pickupDate = new Date(order.pickupTime!);
                        const diffMinutes = (pickupDate.getTime() - orderDate.getTime()) / 60000;
                        return diffMinutes <= 10 ? "ASAP" : pickupDate.toLocaleString([], {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        });
                    })()}
                  </p>


                </div>


                <div className="border rounded-lg p-4 space-y-2 text-sm">
                  <h3 className="font-semibold">Order Summary</h3>
                  <div className="flex justify-between">
                    <span>Items Total</span>
                    <span>{formatPeso(itemsTotal)}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Addons Total</span>
                      <span>{formatPeso(addonsTotal)}</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-{formatPeso(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPeso(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
