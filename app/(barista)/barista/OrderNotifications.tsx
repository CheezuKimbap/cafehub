"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import useSound from "use-sound";

type Notification = {
  id: string;
  message: string;
  dateSent: string;
  isRead: boolean;
};

export function OrderNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const lastIdRef = useRef<string | null>(null);

  // 🔊 sound
  const [play] = useSound("/sounds/notification.mp3", {
    volume: 1,
    soundEnabled: audioUnlocked,
  });

  /* 🔓 listen for layout unlock */
  useEffect(() => {
    const handler = () => setAudioUnlocked(true);
    window.addEventListener("audio-unlock", handler);
    return () => window.removeEventListener("audio-unlock", handler);
  }, []);

  /* 🔁 polling */
  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await fetch("/api/barista/notifications");
      const data: Notification[] = await res.json();

      // 🔔 play sound ONLY if new
      if (
        audioUnlocked &&
        data.length &&
        data[0].id !== lastIdRef.current
      ) {
        lastIdRef.current = data[0].id;
        play();
      }

      setNotifications(data);
    };

    fetchNotifications();
    const i = setInterval(fetchNotifications, 5000);
    return () => clearInterval(i);
  }, [audioUnlocked, play]);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow">
          {notifications.map(n => (
            <div
              key={n.id}
              className={cn(
                "px-4 py-3 text-sm",
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
          ))}
        </div>
      )}
    </div>
  );
}
