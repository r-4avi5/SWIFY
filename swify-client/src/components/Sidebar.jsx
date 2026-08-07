import { NavLink } from "react-router-dom";
import { LayoutGrid, Send, Receipt, ShieldCheck, KeyRound, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    <aside className="w-[244px] shrink-0 flex flex-col gap-7 p-[26px_18px] border-r border-hairline bg-gradient-to-b from-ink-2 to-ink min-h-screen sticky top-0 max-md:fixed max-md:z-40 max-md:-translate-x-full max-md:transition-transform">
      <div className="flex items-center gap-2.5 px-2">
        <span className="w-[34px] h-[34px] rounded-[10px] grid place-items-center bg-gradient-to-br from-brass-soft to-brass text-[#241a08] font-extrabold text-lg">
          S
        </span>
        <span className="font-extrabold text-[1.15rem] tracking-tight">Swify</span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] font-semibold text-[0.92rem] transition-colors ${
                isActive ? "text-brass-soft bg-panel-2" : "text-slate hover:text-ivory hover:bg-panel-2"
              }`
            }
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3.5 rounded-2xl bg-panel border border-hairline">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-[0.92rem]">{user?.displayName}</span>
          <span className="font-mono text-[0.76rem] text-slate">@{user?.swifyId}</span>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 bg-transparent border-none text-coral font-bold text-[0.85rem] cursor-pointer p-0.5 hover:underline"
          onClick={logout}
        >
          <LogOut size={17} strokeWidth={1.8} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
