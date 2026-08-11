import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Copy, Check, Share2 } from "lucide-react";
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
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(n || 0);
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
 
const STATUS_STYLE = {
  success: { label: "Successful", color: "text-[#5ee6a8]", bg: "bg-[#0f2318]" },
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-[#1a1a0f]" },
  failed: { label: "Failed", color: "text-red-400", bg: "bg-[#241111]" },
};
 
export default function SwifyTransactionDetail() {
  const { reference } = useParams();
  const navigate = useNavigate();
 
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
 
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/transactions/${reference}`)
      .then((res) => setTxn(res.data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, [reference]);
 
  const handleCopyReference = () => {
    if (!txn?.reference) return;
    navigator.clipboard.writeText(txn.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
 
  const handleShare = async () => {
    if (!txn) return;
    const text = `Swify payment ${txn.type === "Credit" ? "from" : "to"} ${
      txn.person?.fullname || txn.person?.swifyId
    } — ₹${formatAmount(txn.amount)} · Ref: ${txn.reference}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Swify transaction", text });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
    }
  };
 
  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
 
  if (errorMsg || !txn) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <p className="text-red-400 text-sm">{errorMsg || "Transaction not found."}</p>
        <button
          onClick={() => navigate("/transactions")}
          className="mt-6 text-gray-400 text-sm underline"
        >
          Back to Activity
        </button>
      </div>
    );
  }
 
  const isCredit = txn.type === "Credit";
  const status = STATUS_STYLE[txn.status] || STATUS_STYLE.pending;
 
  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Transaction details</h1>
      </div>
 
      {/* Amount hero */}
      <div className="flex flex-col items-center mt-10 px-5">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isCredit ? "bg-[#0f2318]" : "bg-[#241111]"
          }`}
        >
          {isCredit ? (
            <ArrowDownLeft size={26} className="text-[#5ee6a8]" />
          ) : (
            <ArrowUpRight size={26} className="text-red-400" />
          )}
        </div>
 
        <p
          className={`text-4xl font-bold font-mono mt-4 ${
            isCredit ? "text-[#5ee6a8]" : "text-white"
          }`}
        >
          {isCredit ? "+" : "-"}₹{formatAmount(txn.amount)}
        </p>
 
        <span
          className={`mt-3 text-xs font-semibold px-3 py-1.5 rounded-full ${status.bg} ${status.color}`}
        >
          {status.label}
        </span>
      </div>
 
      {/* Counterparty */}
      <div className="flex flex-col items-center mt-8">
        <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center">
          <span className="text-base font-bold">{initialsOf(txn.person?.fullname)}</span>
        </div>
        <p className="text-gray-500 text-sm mt-2">{isCredit ? "From" : "To"}</p>
        <p className="text-lg font-bold mt-0.5">
          {txn.person?.fullname || txn.person?.swifyId || "Swify user"}
        </p>
        {txn.person?.swifyId && (
          <p className="text-gray-500 text-sm font-mono">${txn.person.swifyId}</p>
        )}
      </div>
 
      {/* Details card */}
      <div className="mx-5 mt-8 bg-[#111111] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <span className="text-gray-500 text-sm">Reference</span>
          <button
            onClick={handleCopyReference}
            className="flex items-center gap-1.5 text-sm font-mono hover:text-white transition-colors duration-200"
          >
            {txn.reference}
            {copied ? (
              <Check size={13} className="text-[#5ee6a8]" />
            ) : (
              <Copy size={13} className="text-gray-500" />
            )}
          </button>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <span className="text-gray-500 text-sm">Date & time</span>
          <span className="text-sm">
            {new Date(txn.createdAt).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
          <span className="text-gray-500 text-sm">Payment method</span>
          <span className="text-sm capitalize">{txn.paymentMethod || "—"}</span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <span className="text-gray-500 text-sm">Note</span>
          <span className="text-sm text-right max-w-[60%]">{txn.note || "—"}</span>
        </div>
      </div>
 
      {/* Actions */}
      <div className="px-5 mt-6 flex gap-3">
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-2 bg-[#111111] rounded-full py-3.5 font-semibold hover:bg-[#1a1a1a] transition-colors duration-200"
        >
          <Share2 size={16} />
          Share receipt
        </button>
        <Link
          to={`/send?to=${txn.person?.swifyId || ""}`}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-black rounded-full py-3.5 font-semibold hover:bg-gray-200 transition-colors duration-200"
        >
          Pay again
        </Link>
      </div>
    </div>
  );
}