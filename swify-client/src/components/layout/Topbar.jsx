import { initials } from "../../lib/format";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import "./Topbar.css";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <h1 className="topbar__title">{title}</h1>
        {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
      </div>

      <div className="topbar__actions">
        <NotificationBell />
        <div className="topbar__avatar" title={user?.fullName}>
          {initials(user?.fullName || user?.displayName || "")}
        </div>
      </div>
    </header>
  );
}
