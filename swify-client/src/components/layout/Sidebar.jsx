import { NavLink } from "react-router-dom";
import { LayoutGrid, Send, Receipt, ShieldCheck, KeyRound, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

const NAV = [
  { to: "/", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/transfer", label: "Send money", icon: Send },
  { to: "/transactions", label: "Activity", icon: Receipt },
  { to: "/kyc", label: "Identity", icon: ShieldCheck },
  { to: "/mpin", label: "MPIN", icon: KeyRound },
  { to: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <span className="sidebar__mark">S</span>
        <span className="sidebar__wordmark">Swify</span>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? "is-active" : ""}`}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <span className="sidebar__user-name">{user?.displayName}</span>
          <span className="sidebar__user-id mono">@{user?.swifyId}</span>
        </div>
        <button type="button" className="sidebar__logout" onClick={logout}>
          <LogOut size={17} strokeWidth={1.8} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
