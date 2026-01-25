"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import useSound from "use-sound";

type Notification = {
  id: string;
  message: string;
  dateSent: string;
  isRead: boolean;
};

export function OrderNotifications() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastIdRef = useRef<string | null>(null);

  /* 🔊 SOUND */
  const [play] = useSound("/sounds/notification.mp3", {
    volume: 1,
    soundEnabled: audioUnlocked,
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  /* 🔓 LISTEN FOR LAYOUT AUDIO UNLOCK */
  useEffect(() => {
    const unlock = () => setAudioUnlocked(true);
    window.addEventListener("audio-unlock", unlock);
    return () => window.removeEventListener("audio-unlock", unlock);
  }, []);

  /* 🔁 POLLING */
  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("/api/barista/notifications");
      const data: Notification[] = await res.json();

      // 🔔 play sound only for NEW notification
     if (data.length && data[0].id !== lastIdRef.current) {
        lastIdRef.current = data[0].id;

        // 🔔 Play sound (if allowed)
        if (audioUnlocked) play();

        // 📡 Notify the rest of the app
        window.dispatchEvent(
            new CustomEvent("new-order-notification", {
            detail: { notificationId: data[0].id },
            })
        );
        }


      setNotifications(data);
    };

    fetchNotifications();
    const i = setInterval(fetchNotifications, 5000);
    return () => clearInterval(i);
  }, [audioUnlocked, play]);

  /* ---------------- READ ONE ---------------- */
  const readOneAndGo = async (id: string) => {
    await fetch("/api/barista/notifications/read-one", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );

    setOpen(false);
    router.push("/barista/orders");
  };

  /* ---------------- READ ALL ---------------- */
  const readAll = async () => {
    await fetch("/api/barista/notifications/read-all", { method: "POST" });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  /* ---------------- CLEAR READ ---------------- */
  const clearAll = async () => {
    await fetch("/api/barista/notifications/clear", { method: "POST" });
    setNotifications(prev => prev.filter(n => !n.isRead));
  };

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setOpen(false);
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🔔 Bell */}
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📋 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          {/* HEADER */}
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-semibold text-sm">Order Notifications</span>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={readAll}
                  className="text-xs text-blue-600 flex items-center gap-1 hover:underline"
                >
                  <CheckCheck className="w-4 h-4" />
                  Read all
                </button>
              )}

              <button
                onClick={clearAll}
                className="text-xs text-red-600 flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* LIST */}
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">
                No notifications
              </p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => readOneAndGo(n.id)}
                  className={cn(
                    "px-4 py-3 cursor-pointer hover:bg-gray-50",
                    !n.isRead && "bg-orange-50"
                  )}
                >
                  <p className="font-medium">{n.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(n.dateSent), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
