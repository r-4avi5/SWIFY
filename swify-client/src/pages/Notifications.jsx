import { Bell, Check, Trash2 } from "lucide-react";
import Topbar from "../components/Topbar";
import EmptyState from "../components/EmptyState";
import { useNotifications } from "../context/NotificationContext";
import { formatDateTime, formatDay } from "../utils/format";

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

      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[640px] flex flex-col gap-2.5">
        {unreadCount > 0 ? (
          <button
            onClick={markAllRead}
            className="self-end bg-none border-none text-brass-soft text-[0.82rem] font-bold cursor-pointer mb-1"
          >
            Mark all {unreadCount} as read
          </button>
        ) : null}

        {items.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications" description="We'll let you know the moment something happens." />
        ) : (
          Object.entries(groups).map(([day, list]) => (
            <div key={day} className="bg-panel border border-hairline rounded-3xl overflow-hidden mb-1.5">
              <p className="m-0 px-[18px] py-3 text-[0.72rem] uppercase tracking-wider text-slate-dim border-b border-hairline">
                {day}
              </p>
              {list.map((n) => (
                <div
                  key={n._id || n.id}
                  className={`flex items-start justify-between gap-3 px-[18px] py-4 border-b border-dashed border-hairline last:border-none ${
                    n.isRead ? "" : "bg-brass/5"
                  }`}
                >
                  <div>
                    <p className="m-0 font-bold text-[0.9rem]">{n.title}</p>
                    <p className="m-[3px_0_5px] text-[0.84rem] text-slate leading-relaxed">{n.message}</p>
                    <span className="text-[0.72rem] text-slate-dim">{formatDateTime(n.createdAt)}</span>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {!n.isRead ? (
                      <button
                        onClick={() => markRead(n._id || n.id)}
                        aria-label="Mark as read"
                        className="w-7 h-7 rounded-full border-none bg-panel-2 text-slate grid place-items-center cursor-pointer hover:bg-panel-3 hover:text-ivory"
                      >
                        <Check size={15} />
                      </button>
                    ) : null}
                    <button
                      onClick={() => remove(n._id || n.id)}
                      aria-label="Delete"
                      className="w-7 h-7 rounded-full border-none bg-panel-2 text-slate grid place-items-center cursor-pointer hover:bg-panel-3 hover:text-ivory"
                    >
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
