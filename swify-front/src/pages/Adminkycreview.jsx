import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Check, X, ShieldAlert } from "lucide-react";
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
 
function DocThumb({ label, src }) {
  return (
    <div>
      <p className="text-gray-500 text-xs mb-1.5">{label}</p>
      {src ? (
        <img
          src={src}
          alt={label}
          className="w-full aspect-[4/3] object-cover rounded-xl bg-[#1a1a1a]"
        />
      ) : (
        <div className="w-full aspect-[4/3] rounded-xl bg-[#1a1a1a] flex items-center justify-center text-gray-600 text-xs">
          Not provided
        </div>
      )}
    </div>
  );
}
 
export default function AdminKycReview() {
  const navigate = useNavigate();
 
  // access: "checking" | "denied" | "ok"
  const [access, setAccess] = useState("checking");
 
  const [submissions, setSubmissions] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
 
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
 
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
 
  // Gate: only admins get past this page at all.
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/user/profile`)
      .then((res) => setAccess(res.data?.isAdmin ? "ok" : "denied"))
      .catch(() => setAccess("denied"));
  }, []);
 
  const loadList = () => {
    setListLoading(true);
    setListError("");
    safeFetchJson(`${API_BASE_URL}/admin/kyc/pending?limit=50`)
      .then((res) => setSubmissions(res.data?.submissions || []))
      .catch((err) => setListError(err.message))
      .finally(() => setListLoading(false));
  };
 
  useEffect(() => {
    if (access === "ok") loadList();
  }, [access]);
 
  const openDetail = (userId) => {
    setSelectedUserId(userId);
    setDetail(null);
    setDetailError("");
    setActionError("");
    setShowRejectInput(false);
    setRejectReason("");
    setDetailLoading(true);
 
    safeFetchJson(`${API_BASE_URL}/admin/kyc/${userId}`)
      .then((res) => setDetail(res.data))
      .catch((err) => setDetailError(err.message))
      .finally(() => setDetailLoading(false));
  };
 
  const handleReview = async (action) => {
    if (action === "REJECT" && !rejectReason.trim()) {
      setShowRejectInput(true);
      return;
    }
 
    setSubmitting(true);
    setActionError("");
    try {
      await safeFetchJson(`${API_BASE_URL}/admin/kyc/${selectedUserId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          ...(action === "REJECT" ? { reason: rejectReason.trim() } : {}),
        }),
      });
      // Back to list, refreshed
      setSelectedUserId(null);
      setDetail(null);
      loadList();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  // ---------- Access gating ----------
  if (access === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
 
  if (access === "denied") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <ShieldAlert size={32} className="text-red-400 mb-4" />
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="text-gray-500 text-sm mt-2">
          You don't have permission to view this page.
        </p>
        <button
          onClick={() => navigate("/home")}
          className="mt-6 text-gray-400 text-sm underline"
        >
          Back to Home
        </button>
      </div>
    );
  }
 
  // ---------- Detail view ----------
  if (selectedUserId) {
    return (
      <div className="min-h-screen w-full bg-black text-white pb-10">
        <div className="flex items-center gap-4 px-5 pt-6">
          <button
            onClick={() => setSelectedUserId(null)}
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">Review submission</h1>
        </div>
 
        {detailLoading ? (
          <div className="flex justify-center mt-16">
            <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
          </div>
        ) : detailError ? (
          <p className="text-red-400 text-sm text-center mt-10 px-5">{detailError}</p>
        ) : (
          detail && (
            <>
              {/* User info */}
              <div className="flex items-center gap-3 px-5 mt-6">
                <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0">
                  {detail.user?.avatar ? (
                    <img
                      src={detail.user.avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-bold">
                      {initialsOf(detail.user?.fullName)}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-bold leading-tight">{detail.user?.fullName}</p>
                  <p className="text-gray-500 text-sm font-mono">${detail.user?.swifyId}</p>
                </div>
              </div>
 
              {/* Contact + ID numbers */}
              <div className="mx-5 mt-5 bg-[#111111] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="text-sm">{detail.user?.email}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="text-sm font-mono">{detail.user?.phone}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
                  <span className="text-gray-500 text-sm">Aadhaar number</span>
                  <span className="text-sm font-mono">{detail.aadharNumber}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-gray-500 text-sm">PAN number</span>
                  <span className="text-sm font-mono">{detail.panNumber}</span>
                </div>
              </div>
 
              {/* Documents */}
              <div className="px-5 mt-6 grid grid-cols-2 gap-3">
                <DocThumb label="Aadhaar — front" src={detail.documents?.aadharFront} />
                <DocThumb label="Aadhaar — back" src={detail.documents?.aadharBack} />
                <DocThumb label="PAN card" src={detail.documents?.panCard} />
                <DocThumb label="Selfie" src={detail.documents?.selfie} />
              </div>
 
              {actionError && (
                <p className="text-red-400 text-sm text-center mt-5 px-5">{actionError}</p>
              )}
 
              {/* Reject reason input */}
              {showRejectInput && (
                <div className="mx-5 mt-5">
                  <div className="bg-[#111111] rounded-2xl px-4 py-3">
                    <label className="text-gray-500 text-sm">Reason for rejection</label>
                    <input
                      type="text"
                      autoFocus
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Aadhaar photo is blurry"
                      className="w-full bg-transparent text-white text-base mt-1 outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              )}
 
              {/* Actions */}
              <div className="px-5 mt-6 flex gap-3">
                <button
                  onClick={() => handleReview("REJECT")}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#241111] text-red-400 rounded-full py-3.5 font-semibold hover:bg-[#331717] transition-colors duration-200 disabled:opacity-50"
                >
                  <X size={18} />
                  {showRejectInput ? "Confirm reject" : "Reject"}
                </button>
                <button
                  onClick={() => handleReview("APPROVE")}
                  disabled={submitting || showRejectInput}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-black rounded-full py-3.5 font-semibold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  <Check size={18} />
                  Approve
                </button>
              </div>
            </>
          )
        )}
      </div>
    );
  }
 
  // ---------- List view (default) ----------
  return (
    <div className="min-h-screen w-full bg-black text-white pb-10">
      <div className="flex items-center gap-4 px-5 pt-6">
        <button
          onClick={() => navigate("/home")}
          className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">KYC review queue</h1>
      </div>
 
      <div className="px-5 mt-6">
        {listLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#0d0d0d] rounded-xl mt-2 animate-pulse" />
          ))
        ) : listError ? (
          <p className="text-red-400 text-sm text-center mt-10">{listError}</p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            Nothing pending review right now.
          </p>
        ) : (
          submissions.map((s) => (
            <button
              key={s.id}
              onClick={() => openDetail(s.userId)}
              className="w-full flex items-center justify-between py-3.5 border-b border-[#1a1a1a] last:border-0 hover:bg-[#0d0d0d] transition-colors duration-150 -mx-2 px-2 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden shrink-0">
                  {s.avatar ? (
                    <img src={s.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold">{initialsOf(s.fullName)}</span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">{s.fullName}</p>
                  <p className="text-xs text-gray-500 font-mono">${s.swifyId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">
                  {new Date(s.submittedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}