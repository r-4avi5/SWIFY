import { initials } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="flex items-start justify-between gap-4 px-10 pt-[30px] pb-3.5 max-sm:px-5 max-sm:pt-[22px]">
      <div>
        <h1 className="m-0 text-2xl font-extrabold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 mb-0 text-slate text-sm">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3.5">
        <NotificationBell />
        <div
          className="w-10 h-10 rounded-full bg-panel-2 border border-hairline grid place-items-center font-extrabold text-[0.82rem] text-brass-soft"
          title={user?.fullName}
        >
          {initials(user?.fullName || user?.displayName || "")}
        </div>
      </div>
    </header>
  );
}
