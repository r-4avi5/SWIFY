import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Check, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { formatDateTime } from "../../lib/format";
import "./NotificationBell.css";

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
    <div className="notif-bell" ref={ref}>
      <button
        type="button"
        className="notif-bell__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
      >
        <Bell size={19} strokeWidth={1.8} />
        {unreadCount > 0 ? <span className="notif-bell__dot">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="notif-bell__panel"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <div className="notif-bell__head">
              <span>Notifications</span>
              {unreadCount > 0 ? (
                <button type="button" onClick={markAllRead} className="notif-bell__markall">
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="notif-bell__list scrollbar-thin">
              {items.length === 0 ? (
                <div className="notif-bell__empty">You're all caught up.</div>
              ) : (
                items.slice(0, 6).map((n) => (
                  <div key={n._id || n.id} className={`notif-bell__item ${n.isRead ? "" : "is-unread"}`}>
                    <div className="notif-bell__item-body">
                      <p className="notif-bell__item-title">{n.title}</p>
                      <p className="notif-bell__item-msg">{n.message}</p>
                      <span className="notif-bell__item-time">{formatDateTime(n.createdAt)}</span>
                    </div>
                    <div className="notif-bell__item-actions">
                      {!n.isRead ? (
                        <button type="button" onClick={() => markRead(n._id || n.id)} aria-label="Mark as read">
                          <Check size={14} />
                        </button>
                      ) : null}
                      <button type="button" onClick={() => remove(n._id || n.id)} aria-label="Delete notification">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link to="/notifications" className="notif-bell__viewall" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
