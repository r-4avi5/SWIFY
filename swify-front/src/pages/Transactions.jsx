import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Search, X } from "lucide-react";
 
const API_BASE_URL = "http://localhost:3000/api";
const PAGE_SIZE = 20;
 
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
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
 
const FILTERS = [
  { key: "all", label: "All" },
  { key: "Credit", label: "Received" },
  { key: "Debit", label: "Sent" },
];
 
export default function SwifyTransactions() {
  const navigate = useNavigate();
 
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
 
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
 
  const loadPage = useCallback(async (pageNum, replace = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setErrorMsg("");
 
    try {
      const res = await safeFetchJson(
        `${API_BASE_URL}/transactions?page=${pageNum}&limit=${PAGE_SIZE}`
      );
      setTotalPages(res.totalPages || 1);
      setTransactions((prev) =>
        replace ? res.transactions || [] : [...prev, ...(res.transactions || [])]
      );
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);
 
  useEffect(() => {
    loadPage(1, true);
  }, [loadPage]);
 
  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  };
 
  const filtered = useMemo(() => {
    return transactions.filter((txn) => {
      if (filter !== "all" && txn.type !== filter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const name = txn.person?.fullname?.toLowerCase() || "";
        const swifyId = txn.person?.swifyId?.toLowerCase() || "";
        const note = txn.note?.toLowerCase() || "";
        if (!name.includes(q) && !swifyId.includes(q) && !note.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, filter, search]);
 
  const grouped = useMemo(() => {
    const groups = {};
    for (const txn of filtered) {
      const label = dateGroupLabel(txn.createdAt);
      if (!groups[label]) groups[label] = [];
      groups[label].push(txn);
    }
    return groups;
  }, [filtered]);
 
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
        <h1 className="text-lg font-bold">Activity</h1>
      </div>
 
      {/* Search */}
      <div className="px-5 mt-5">
        <div className="flex items-center gap-3 bg-[#111111] rounded-full px-4 py-3">
          <Search size={16} className="text-gray-500 shrink-0" />
          <input
            type="text"
            placeholder="Search by name, ID, or note"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-gray-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
      </div>
 
      {/* Filter chips */}
      <div className="flex gap-2 px-5 mt-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`text-sm px-4 py-2 rounded-full border transition-colors duration-200 ${
              filter === f.key
                ? "bg-white text-black border-white font-semibold"
                : "bg-[#111111] text-gray-400 border-[#222] hover:border-gray-500"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
 
      {/* List */}
      <div className="px-5 mt-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-[#0d0d0d] rounded-xl mt-2 animate-pulse" />
          ))
        ) : errorMsg && transactions.length === 0 ? (
          <p className="text-red-400 text-sm text-center mt-10">{errorMsg}</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-sm text-center mt-10">
            {search || filter !== "all"
              ? "No transactions match your search."
              : "No transactions yet."}
          </p>
        ) : (
          Object.entries(grouped).map(([label, txns]) => (
            <div key={label} className="mb-5">
              <p className="text-gray-500 text-sm mb-1">{label}</p>
              {txns.map((txn) => {
                const isCredit = txn.type === "Credit";
                return (
                  <button
                    key={txn.reference}
                    onClick={() => navigate(`/transactions/${txn.reference}`)}
                    className="w-full flex items-center justify-between py-3 border-b border-[#1a1a1a] last:border-0 hover:bg-[#0d0d0d] transition-colors duration-150 -mx-2 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${
                          isCredit ? "bg-[#0f2318]" : "bg-[#241111]"
                        }`}
                      >
                        {isCredit ? (
                          <ArrowDownLeft size={16} className="text-[#5ee6a8]" />
                        ) : (
                          <ArrowUpRight size={16} className="text-red-400" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white">
                          {txn.person?.fullname || txn.person?.swifyId || "Swify user"}
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
                  </button>
                );
              })}
            </div>
          ))
        )}
 
        {/* Load more */}
        {!loading && page < totalPages && filter === "all" && !search && (
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="w-full text-center text-sm text-gray-400 py-4 hover:text-white transition-colors duration-200 disabled:opacity-50"
          >
            {loadingMore ? "Loading…" : "Load more"}
          </button>
        )}
      </div>
    </div>
  );
}