import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { formatDateTime } from "../utils/format";

export default function NotificationBell() {
  const { items, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="relative w-10 h-10 rounded-full border border-hairline bg-panel text-ivory grid place-items-center cursor-pointer hover:border-hairline-strong"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={19} strokeWidth={1.8} />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-[#2a0a0a] text-[0.65rem] font-extrabold grid place-items-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="absolute right-0 top-[50px] w-[340px] max-w-[86vw] bg-panel border border-hairline rounded-2xl shadow-2xl overflow-hidden z-[60]"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-hairline font-bold text-sm">
              <span>Notifications</span>
              {unreadCount > 0 ? (
                <button type="button" onClick={markAllRead} className="bg-none border-none text-brass-soft text-[0.76rem] font-bold cursor-pointer">
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {items.length === 0 ? (
                <div className="py-7 px-4 text-center text-slate text-sm">You're all caught up.</div>
              ) : (
                items.slice(0, 6).map((n) => (
                  <div
                    key={n._id || n.id}
                    className={`flex gap-2 px-4 py-3 border-b border-hairline relative ${
                      n.isRead ? "" : "bg-brass/5 before:content-[''] before:absolute before:left-1.5 before:top-[18px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-brass"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="m-0 text-[0.85rem] font-bold">{n.title}</p>
                      <p className="m-[2px_0_4px] text-[0.8rem] text-slate">{n.message}</p>
                      <span className="text-[0.7rem] text-slate-dim">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {!n.isRead ? (
                        <button
                          type="button"
                          onClick={() => markRead(n._id || n.id)}
                          aria-label="Mark as read"
                          className="w-[26px] h-[26px] rounded-full border-none bg-panel-2 text-slate grid place-items-center cursor-pointer hover:text-ivory hover:bg-panel-3"
                        >
                          <Check size={14} />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => remove(n._id || n.id)}
                        aria-label="Delete notification"
                        className="w-[26px] h-[26px] rounded-full border-none bg-panel-2 text-slate grid place-items-center cursor-pointer hover:text-ivory hover:bg-panel-3"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/notifications"
              className="block text-center py-3 text-[0.82rem] font-bold text-brass-soft border-t border-hairline hover:bg-panel-2"
              onClick={() => setOpen(false)}
            >
              View all notifications
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
