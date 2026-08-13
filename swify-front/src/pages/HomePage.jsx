import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Landmark,
  X,
  ShieldCheck,
  ChevronRight,
  Home as HomeIcon,
  Receipt,
  ScanLine,
  CreditCard,
  User as UserIcon,
} from "lucide-react";
import { API_BASE_URL } from "../config";
 
 
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
 
function formatAmount(n) {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n);
}
 
function initialsOf(name) {
  return (
    (name || "")
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "?"
  );
}
 
function dateGroupLabel(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
 
  const sameDay = (a, b) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();
 
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
 
export default function SwifyHome() {
  const navigate = useNavigate();
 
  const [profile, setProfile] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
 
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [kycBannerDismissed, setKycBannerDismissed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [kycStatus, setKycStatus] = useState(null);
 
  useEffect(() => {
    (async () => {
      try {
        const [profileRes, walletRes, txnRes, unreadRes, kycRes] = await Promise.all([
          safeFetchJson(`${API_BASE_URL}/user/profile`),
          safeFetchJson(`${API_BASE_URL}/wallet`),
          safeFetchJson(`${API_BASE_URL}/transactions?limit=20`),
          safeFetchJson(`${API_BASE_URL}/notifications/unread-count`),
          safeFetchJson(`${API_BASE_URL}/kyc/status`),
        ]);
        setProfile(profileRes.data);
        setWallet(walletRes.data);
        setTransactions(txnRes.transactions || txnRes.data || []);
        setUnreadCount(unreadRes.data?.unreadCount || 0);
        setKycStatus(kycRes.data?.status || null);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
 
  // Derived: this-week in/out totals (no dedicated backend endpoint yet —
  // computed from the fetched transaction list as an approximation)
  const { weeklyIn, weeklyOut } = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
 
    let inAmt = 0;
    let outAmt = 0;
    for (const txn of transactions) {
      const created = new Date(txn.createdAt);
      if (created < weekAgo) continue;
      if (txn.type === "Credit") inAmt += txn.amount;
      else outAmt += txn.amount;
    }
    return { weeklyIn: inAmt, weeklyOut: outAmt };
  }, [transactions]);
 
  const weeklyTotal = weeklyIn + weeklyOut;
  const inPct = weeklyTotal > 0 ? (weeklyIn / weeklyTotal) * 100 : 0;
 
  // Derived: recent unique counterparties for "Send Again"
  // (no dedicated backend endpoint — deduped from transaction history)
  const recentContacts = useMemo(() => {
    const seen = new Map();
    for (const txn of transactions) {
      const counterparty = txn.person;
      if (!counterparty?.swifyId) continue;
      if (!seen.has(counterparty.swifyId)) {
        seen.set(counterparty.swifyId, counterparty);
      }
    }
    return Array.from(seen.values()).slice(0, 8);
  }, [transactions]);
 
  // Group transactions by date for the Activity section
  const groupedTransactions = useMemo(() => {
    const groups = {};
    for (const txn of transactions) {
      const label = dateGroupLabel(txn.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(txn);
    }
    return groups;
  }, [transactions]);
 
  const kycVerified = kycStatus === "VERIFIED";
  const kycUnderReview = kycStatus === "UNDER_REVIEW";
  // Only nag the user when there's something actionable: they haven't
  // submitted yet, or a submission was rejected and needs resubmitting.
  // Once submitted and awaiting review, or already verified, stay quiet.
  const showKycBanner = !kycVerified && !kycUnderReview && !kycBannerDismissed;
 
  const initials = initialsOf(profile?.displayName || profile?.fullName);
 
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col">
 
      <div className="flex-1 overflow-y-auto pb-24">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-6">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-base font-bold">{initials}</span>
              )}
            </div>
            <div>
              <p className="text-base font-bold leading-tight">
                {profile?.fullName || profile?.displayName || "Your account"}
              </p>
              <p className="text-gray-500 text-sm leading-tight">
                {profile?.swifyId ? `$${profile.swifyId}` : ""}
              </p>
            </div>
          </Link>
 
          <button
            onClick={() => navigate("/notifications")}
            className="relative w-11 h-11 rounded-full bg-[#111111] border border-[#222] flex items-center justify-center hover:border-white transition-colors duration-200"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        </div>
 
        {/* Balance card */}
        <div className="mx-5 mt-6 bg-[#111111] border border-[#222] rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs tracking-[0.15em]">SWIFY BALANCE</p>
            <button
              onClick={() => setBalanceHidden(!balanceHidden)}
              className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-white transition-colors duration-200"
            >
              {balanceHidden ? <EyeOff size={16} /> : <Eye size={16} />}
              {balanceHidden ? "Show" : "Hide"}
            </button>
          </div>
 
          {loading ? (
            <div className="h-10 w-48 bg-[#1a1a1a] rounded-lg mt-3 animate-pulse" />
          ) : errorMsg ? (
            <p className="text-red-400 text-sm mt-3">{errorMsg}</p>
          ) : (
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-light text-gray-400">₹</span>
              <h1 className="text-5xl font-mono font-bold tracking-tight">
                {balanceHidden ? "••,•••.••" : formatAmount(wallet?.balance ?? 0)}
              </h1>
            </div>
          )}
 
          {/* Weekly in/out progress */}
          <div className="mt-5">
            <div className="h-1.5 w-full bg-[#2a2a2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${inPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-3 text-sm">
              <span className="text-gray-500">
                In this week{" "}
                <span className="text-white font-semibold">₹{formatAmount(weeklyIn)}</span>
              </span>
              <span className="text-gray-500">
                Out <span className="text-gray-300 font-mono">₹{formatAmount(weeklyOut)}</span>
              </span>
            </div>
          </div>
        </div>
 
        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3 px-5 mt-6">
          <Link
            to="/send"
            className="flex flex-col items-center gap-2 bg-[#111111] border border-[#222] hover:border-white transition-colors duration-200 rounded-2xl py-4"
          >
            <ArrowUpRight size={20} />
            <span className="text-xs font-medium">Send</span>
          </Link>
          <Link
            to="/request"
            className="flex flex-col items-center gap-2 bg-[#111111] border border-[#222] hover:border-white transition-colors duration-200 rounded-2xl py-4"
          >
            <ArrowDownLeft size={20} />
            <span className="text-xs font-medium">Request</span>
          </Link>
          <Link
            to="/topup"
            className="flex flex-col items-center gap-2 bg-[#111111] border border-[#222] hover:border-white transition-colors duration-200 rounded-2xl py-4"
          >
            <Plus size={20} />
            <span className="text-xs font-medium">Top up</span>
          </Link>
          <Link
            to="/withdraw"
            className="flex flex-col items-center gap-2 bg-[#111111] border border-[#222] hover:border-white transition-colors duration-200 rounded-2xl py-4"
          >
            <Landmark size={20} />
            <span className="text-xs font-medium">To bank</span>
          </Link>
        </div>
 
        {/* KYC banner */}
        {showKycBanner && (
          <div className="mx-5 mt-6 bg-[#111111] border border-[#222] rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                  <ShieldCheck size={14} className="text-black" />
                </div>
                <h3 className="text-base font-bold">Finish verification to transact</h3>
              </div>
              <button
                onClick={() => setKycBannerDismissed(true)}
                className="text-gray-500 hover:text-white transition-colors duration-200"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              {kycStatus === "REJECTED"
                ? "Your last submission was rejected. Please resubmit your documents."
                : kycStatus === "UNDER_REVIEW"
                ? "Your documents are under review. Sending and top-ups unlock once approved."
                : "Complete identity verification. Sending and top-ups unlock once approved."}
            </p>
            <Link
              to="/kyc"
              className="inline-flex items-center gap-1 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-full mt-4 hover:bg-gray-200 transition-colors duration-200"
            >
              Continue KYC
              <ChevronRight size={16} />
            </Link>
          </div>
        )}
 
        {/* Send again */}
        {recentContacts.length > 0 && (
          <div className="mt-8">
            <p className="px-5 text-gray-500 text-xs tracking-[0.15em]">SEND AGAIN</p>
            <div className="flex gap-4 px-5 mt-3 overflow-x-auto no-scrollbar">
              <Link to="/send" className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 flex items-center justify-center">
                  <Plus size={18} className="text-gray-500" />
                </div>
                <span className="text-[11px] text-gray-500">New</span>
              </Link>
              {recentContacts.map((c) => (
                <Link
                  key={c.swifyId}
                  to={`/send?to=${c.swifyId}`}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                    <span className="text-sm font-bold">{initialsOf(c.fullname)}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 max-w-[56px] truncate">
                    {c.fullname?.split(" ")[0] || c.swifyId}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
 
        {/* Activity */}
        <div className="px-5 mt-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-500 text-xs tracking-[0.15em]">ACTIVITY</p>
            <Link
              to="/transactions"
              className="flex items-center gap-1 text-sm font-semibold text-white"
            >
              See all
              <ChevronRight size={14} />
            </Link>
          </div>
 
          <div className="mt-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-[#0d0d0d] rounded-xl mt-2 animate-pulse" />
              ))
            ) : transactions.length === 0 ? (
              <p className="text-gray-500 text-sm mt-6 text-center">
                No transactions yet. Send or request money to get started.
              </p>
            ) : (
              Object.entries(groupedTransactions).map(([label, txns]) => (
                <div key={label} className="mb-4">
                  <p className="text-gray-500 text-sm mb-1">{label}</p>
                  {txns.map((txn) => {
                    const isCredit = txn.type === "Credit";
                    const counterparty = txn.person;
                    return (
                      <div
                        key={txn.reference}
                        className="flex items-center justify-between py-3 border-b border-[#1a1a1a] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {initialsOf(counterparty?.fullname)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {counterparty?.fullname || counterparty?.swifyId || "Swify user"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {txn.note || (isCredit ? "Received" : "Sent")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-mono font-semibold ${
                              isCredit ? "text-[#5ee6a8]" : "text-gray-300"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {formatAmount(txn.amount)}
                          </p>
                          <p className="text-xs text-gray-600 font-mono">
                            {new Date(txn.createdAt).toLocaleTimeString("en-IN", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
 
      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-[#1a1a1a] px-2 pt-2 pb-safe">
        <div className="flex items-center justify-between max-w-md mx-auto px-3 pb-3">
          <Link to="/home" className="flex flex-col items-center gap-1 text-white">
            <HomeIcon size={22} />
            <span className="text-[11px] font-medium">Home</span>
          </Link>
          <Link to="/transactions" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors duration-200">
            <Receipt size={22} />
            <span className="text-[11px]">Activity</span>
          </Link>
          <Link
            to="/scan"
            className="w-14 h-14 rounded-full bg-white flex items-center justify-center -mt-4 shadow-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <ScanLine size={22} className="text-black" />
          </Link>
          <Link to="/cards" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors duration-200">
            <CreditCard size={22} />
            <span className="text-[11px]">Cards</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-gray-500 hover:text-white transition-colors duration-200">
            <UserIcon size={22} />
            <span className="text-[11px]">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}