import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationAsRead,
  deleteNotification,
} from "../api/notification.api";
import { getSocket } from "../lib/socket";
import { SOCKET_EVENTS } from "../constants/socket.events";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { status } = useAuth();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (status !== "authed") return;
    try {
      const [listRes, countRes] = await Promise.all([
        getNotifications(1, 20),
        getUnreadNotificationCount(),
      ]);
      setItems(listRes.data.data?.notifications ?? listRes.data.data ?? []);
      setUnreadCount(countRes.data.data?.unreadCount ?? 0);
    } catch {
      // notifications are a nice-to-have; fail quietly
    }
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (status !== "authed") return;
    const socket = getSocket();
    if (!socket) return;

    const onNotification = (notification) => {
      setItems((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on(SOCKET_EVENTS.NOTIFICATION, onNotification);
    return () => socket.off(SOCKET_EVENTS.NOTIFICATION, onNotification);
  }, [status]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await markNotificationAsRead(id);
    } catch {
      /* optimistic UI already applied */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationAsRead();
    } catch {
      /* optimistic UI already applied */
    }
  }, []);

  const remove = useCallback(async (id) => {
    setItems((prev) => prev.filter((n) => n._id !== id && n.id !== id));
    try {
      await deleteNotification(id);
    } catch {
      /* optimistic UI already applied */
    }
  }, []);

  const value = useMemo(
    () => ({ items, unreadCount, refresh, markRead, markAllRead, remove }),
    [items, unreadCount, refresh, markRead, markAllRead, remove]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
};
