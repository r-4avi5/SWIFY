import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  KeyRound,
  Bell,
  Trash2,
  CheckCheck,
} from "lucide-react";
 
const API_BASE_URL = "http://localhost:3000/api";
const PAGE_SIZE = 20;
 
async function safeFetchJson(url, options) {
  const res = await fetch(url, { credentials: "include", ...options });
  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error("Server didn't return valid JSON. Check the backend is running.");
  }
  if (!res.ok || !data.success) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}
 
function timeAgo(dateStr) {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
 
const TYPE_ICON = {
  PAYMENT_SENT: { icon: ArrowUpRight, bg: "bg-[#241111]", color: "text-red-400" },
  PAYMENT_RECEIVED: { icon: ArrowDownLeft, bg: "bg-[#0f2318]", color: "text-[#5ee6a8]" },
  KYC_SUBMITTED: { icon: ShieldAlert, bg: "bg-[#1a1a0f]", color: "text-yellow-400" },
  KYC_APPROVED: { icon: ShieldCheck, bg: "bg-[#0f2318]", color: "text-[#5ee6a8]" },
  KYC_REJECTED: { icon: ShieldX, bg: "bg-[#241111]", color: "text-red-400" },
  MPIN_CREATED: { icon: KeyRound, bg: "bg-[#111827]", color: "text-blue-400" },
  MPIN_CHANGED: { icon: KeyRound, bg: "bg-[#111827]", color: "text-blue-400" },
  SYSTEM: { icon: Bell, bg: "bg-[#161616]", color: "text-gray-400" },
};
 
function NotificationRow({ notification, onMarkRead, onDelete }) {
  const config = TYPE_ICON[notification.type] || TYPE_ICON.SYSTEM;
  const Icon = config.icon;
 
  return (
    <div
      onClick={() => !notification.isRead && onMarkRead(notification._id)}
      className={`flex items-start gap-3 px-5 py-4 border-b border-[#1a1a1a] last:border-0 transition-colors duration-150 ${
        notification.isRead ? "" : "bg-[#0d0d0d] cursor-pointer"
      }`}
    >
      <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center shrink-0 mt-0.5`}>
        <Icon size={16} className={config.color} />
      </div>
 
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm ${notification.isRead ? "font-medium text-gray-300" : "font-bold text-white"}`}>
            {notification.title}
          </p>
          {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{notification.message}</p>
        <p className="text-xs text-gray-600 mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
 
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        className="text-gray-600 hover:text-red-400 transition-colors duration-200 p-1 shrink-0"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
 
export default function SwifyNotifications() {
  const navigate = useNavigate();
 
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
 
  const loadPage = useCallback(async (pageNum, replace = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setErrorMsg("");
 
    try {
      const res = await safeFetchJson(
        `${API_BASE_URL}/notifications?page=${pageNum}&limit=${PAGE_SIZE}`
      );
      setTotalPages(res.data?.totalPages || 1);
      setNotifications((prev) =>
        replace ? res.data?.notifications || [] : [...prev, ...(res.data?.notifications || [])]
      );
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);
 
  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);
 
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  };
 
  const handleMarkRead = async (id) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      await safeFetchJson(`${API_BASE_URL}/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      // Revert on failure
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
    }
  };
 
  const handleDelete = async (id) => {
    const prevState = notifications;
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    try {
      await safeFetchJson(`${API_BASE_URL}/notifications/${id}`, { method: "DELETE" });
    } catch (err) {
      setNotifications(prevState); // revert
      setErrorMsg(err.message);
    }
  };
 
  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    const prevState = notifications;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await safeFetchJson(`${API_BASE_URL}/notifications/read-all`, { method: "PATCH" });
    } catch (err) {
      setNotifications(prevState);
      setErrorMsg(err.message);
    } finally {
      setMarkingAll(false);
    }
  };
 
  const hasUnread = notifications.some((n) => !n.isRead);
 
  return (
    <div className="min-h-screen w-full bg-black text-white pb-10">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/home")}
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>
 
        {hasUnread && (
          <button
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>
 
      {/* List */}
      <div className="mt-4">
        {loading ? (
          <div className="px-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-[#0d0d0d] rounded-xl mt-2 animate-pulse" />
            ))}
          </div>
        ) : errorMsg && notifications.length === 0 ? (
          <p className="text-red-400 text-sm text-center mt-10 px-5">{errorMsg}</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center mt-16 px-5">
            <div className="w-16 h-16 rounded-full bg-[#111111] flex items-center justify-center">
              <Bell size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm mt-4 text-center">
              You're all caught up — no notifications yet.
            </p>
          </div>
        ) : (
          <>
            {notifications.map((n) => (
              <NotificationRow
                key={n._id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
 
            {page < totalPages && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="w-full text-center text-sm text-gray-400 py-4 hover:text-white transition-colors duration-200 disabled:opacity-50"
              >
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}