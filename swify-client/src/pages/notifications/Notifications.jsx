import { Bell, Check, Trash2 } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import EmptyState from "../../components/common/EmptyState";
import { useNotifications } from "../../context/NotificationContext";
import { formatDateTime, formatDay } from "../../lib/format";
import "./Notifications.css";

export default function Notifications() {
  const { items, unreadCount, markRead, markAllRead, remove } = useNotifications();

  const groups = items.reduce((acc, n) => {
    const day = formatDay(n.createdAt) || "Earlier";
    acc[day] = acc[day] || [];
    acc[day].push(n);
    return acc;
  }, {});

  return (
    <>
      <Topbar title="Notifications" subtitle="Payments, KYC updates, and security alerts." />

      <div className="notifications-page">
        {unreadCount > 0 ? (
          <button className="notifications-page__markall" onClick={markAllRead}>
            Mark all {unreadCount} as read
          </button>
        ) : null}

        {items.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="We'll let you know the moment something happens." />
        ) : (
          Object.entries(groups).map(([day, list]) => (
            <div key={day} className="notifications-page__group">
              <p className="notifications-page__day">{day}</p>
              {list.map((n) => (
                <div key={n._id || n.id} className={`notifications-page__item ${n.isRead ? "" : "is-unread"}`}>
                  <div>
                    <p className="notifications-page__title">{n.title}</p>
                    <p className="notifications-page__msg">{n.message}</p>
                    <span className="notifications-page__time">{formatDateTime(n.createdAt)}</span>
                  </div>
                  <div className="notifications-page__actions">
                    {!n.isRead ? (
                      <button onClick={() => markRead(n._id || n.id)} aria-label="Mark as read">
                        <Check size={15} />
                      </button>
                    ) : null}
                    <button onClick={() => remove(n._id || n.id)} aria-label="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
