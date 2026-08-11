import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ChevronRight,
  Copy,
  Check,
  LogOut,
  QrCode,
} from "lucide-react";
 
const API_BASE_URL = "http://localhost:3000/api";
 
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
 
function InfoRow({ label, value, copyable, mono }) {
  const [copied, setCopied] = useState(false);
 
  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
 
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a] last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm text-white ${mono ? "font-mono" : ""}`}>
          {value || "—"}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="text-gray-500 hover:text-white transition-colors duration-200"
          >
            {copied ? <Check size={14} className="text-[#5ee6a8]" /> : <Copy size={14} />}
          </button>
        )}
      </div>
    </div>
  );
}
 
function ShortcutRow({ icon, label, sublabel, sublabelClass, to }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between bg-[#111111] hover:bg-[#161616] transition-colors duration-200 rounded-2xl px-4 py-3.5"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          {sublabel && (
            <p className={`text-xs ${sublabelClass || "text-gray-500"}`}>{sublabel}</p>
          )}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-600" />
    </Link>
  );
}
 
export default function SwifyProfile() {
  const navigate = useNavigate();
 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
 
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/user/profile`)
      .then((res) => setProfile(res.data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, []);
 
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      // NOTE: no /api/auth/logout route exists yet on the backend.
      // This call will 404 until one is added that does res.clearCookie("token").
      await safeFetchJson(`${API_BASE_URL}/auth/logout`, { method: "POST" });
      navigate("/login");
    } catch (err) {
      setErrorMsg(err.message || "Couldn't log out. Please try again.");
      setLoggingOut(false);
    }
  };
 
  const initials = initialsOf(profile?.displayName || profile?.fullName);
  const kycVerified = profile?.kycStatus === "VERIFIED";
  const kycPending = profile?.kycStatus === "UNDER_REVIEW";
 
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : null;
 
  return (
    <div className="min-h-screen w-full bg-black text-white pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6">
        <button
          onClick={() => navigate("/home")}
          className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Profile</h1>
      </div>
 
      {loading ? (
        <div className="flex flex-col items-center mt-10">
          <div className="w-24 h-24 rounded-full bg-[#111111] animate-pulse" />
          <div className="h-5 w-32 bg-[#111111] rounded mt-4 animate-pulse" />
        </div>
      ) : errorMsg && !profile ? (
        <p className="text-red-400 text-sm text-center mt-10 px-5">{errorMsg}</p>
      ) : (
        <>
          {/* Avatar + name */}
          <div className="flex flex-col items-center mt-4">
            <div className="w-24 h-24 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-3xl font-bold">{initials}</span>
              )}
            </div>
            <h2 className="text-xl font-bold mt-4">{profile?.fullName}</h2>
            <p className="text-gray-500 text-sm font-mono mt-1">${profile?.swifyId}</p>
            {memberSince && (
              <p className="text-gray-600 text-xs mt-1">Member since {memberSince}</p>
            )}
          </div>
 
          {/* QR code */}
          <div className="mx-5 mt-6 bg-[#111111] rounded-2xl px-5 py-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-gray-500 text-xs">Your pay address</p>
                <p className="text-sm font-mono mt-1">{profile?.payAddress || "Not set"}</p>
              </div>
            </div>
 
            {profile?.qrCodeImage ? (
              <div className="flex flex-col items-center">
                <div className="bg-white rounded-2xl p-4">
                  <img
                    src={profile.qrCodeImage}
                    alt="Your Swify QR code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <p className="text-gray-500 text-xs mt-3">
                  Others can scan this to pay you instantly
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-6">
                <div className="w-48 h-48 rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
                  <QrCode size={40} className="text-gray-700" />
                </div>
                <p className="text-gray-500 text-xs text-center mt-3 max-w-[220px]">
                  Your QR code is generated once identity verification is approved
                </p>
              </div>
            )}
          </div>
 
          {/* Account & Security shortcuts */}
          <div className="px-5 mt-6 flex flex-col gap-3">
            <ShortcutRow
              to="/kyc"
              icon={
                kycVerified ? (
                  <ShieldCheck size={16} className="text-[#5ee6a8]" />
                ) : (
                  <ShieldAlert size={16} className="text-yellow-400" />
                )
              }
              label="Identity verification"
              sublabel={
                kycVerified ? "Verified" : kycPending ? "Under review" : "Not verified"
              }
              sublabelClass={
                kycVerified
                  ? "text-[#5ee6a8]"
                  : kycPending
                  ? "text-yellow-400"
                  : "text-red-400"
              }
            />
            <ShortcutRow
              to="/security/mpin"
              icon={<KeyRound size={16} className="text-white" />}
              label="Security & MPIN"
              sublabel={profile?.isMpinSet ? "MPIN set" : "Set up your MPIN"}
              sublabelClass={profile?.isMpinSet ? "text-gray-500" : "text-yellow-400"}
            />
          </div>
 
          {/* Personal details */}
          <p className="px-5 mt-8 text-gray-500 text-xs tracking-[0.15em]">PERSONAL DETAILS</p>
          <div className="mx-5 mt-3 bg-[#111111] rounded-2xl overflow-hidden">
            <InfoRow label="Full name" value={profile?.fullName} />
            <InfoRow label="Display name" value={profile?.displayName} />
            <InfoRow label="Email" value={profile?.email} />
            <InfoRow label="Phone" value={profile?.phone} mono />
          </div>
 
          {/* Swify identity */}
          <p className="px-5 mt-8 text-gray-500 text-xs tracking-[0.15em]">SWIFY IDENTITY</p>
          <div className="mx-5 mt-3 bg-[#111111] rounded-2xl overflow-hidden">
            <InfoRow label="Swify ID" value={`$${profile?.swifyId}`} copyable mono />
            <InfoRow label="Pay address" value={profile?.payAddress} copyable mono />
          </div>
 
          {errorMsg && (
            <p className="text-red-400 text-sm text-center mt-6 px-5">{errorMsg}</p>
          )}
 
          {/* Logout */}
          <div className="px-5 mt-8">
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#1a1010] border border-[#222] hover:border-red-900 transition-colors duration-200 rounded-2xl py-4 text-red-400 font-semibold disabled:opacity-50"
            >
              <LogOut size={18} />
              {loggingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}