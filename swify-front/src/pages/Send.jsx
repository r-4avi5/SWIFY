import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Check, X, ChevronRight, Pencil, Delete } from "lucide-react";
import { API_BASE_URL } from "../config";
 
const PIN_LENGTH = 6;
 
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
 
export default function SwifySend() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledTo = searchParams.get("to") || "";
 
  // stage: "recipient" | "amount" | "review" | "mpin" | "success"
  const [stage, setStage] = useState("recipient");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
 
  // Recipient resolve
  const [identifier, setIdentifier] = useState(prefilledTo);
  const [resolvedUser, setResolvedUser] = useState(null);
  const [resolving, setResolving] = useState(false);
 
  // Amount + note
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
 
  // MPIN
  const [pin, setPin] = useState("");
 
  // Result
  const [transferResult, setTransferResult] = useState(null);
 
  // Wallet balance + last payment to this recipient (for the context line)
  const [walletBalance, setWalletBalance] = useState(null);
  const [lastPayment, setLastPayment] = useState(null); // { amount, daysAgo }
 
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/wallet/balance`)
      .then((res) => setWalletBalance(res.data?.balance ?? res.data ?? null))
      .catch(() => {});
  }, []);
 
  const fetchLastPayment = async (swifyId) => {
    if (!swifyId) return;
    try {
      const res = await safeFetchJson(`${API_BASE_URL}/transactions?limit=20`);
      const txns = res.transactions || res.data || [];
      const match = txns.find(
        (t) =>
          t.status === "success" && t.person?.swifyId === swifyId
      );
      if (match) {
        const days = Math.max(
          0,
          Math.floor((Date.now() - new Date(match.createdAt).getTime()) / 86400000)
        );
        setLastPayment({ amount: match.amount, daysAgo: days });
      } else {
        setLastPayment(null);
      }
    } catch {
      setLastPayment(null);
    }
  };
 
  const noteChips = ["Dinner", "Rent", "Cab", "Thanks!"];
 
  useEffect(() => {
    if (prefilledTo) handleResolve(prefilledTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  const handleResolve = async (value) => {
    const target = (value ?? identifier).trim();
    if (!target) return;
 
    setResolving(true);
    setErrorMsg("");
    try {
      const res = await safeFetchJson(`${API_BASE_URL}/payment-identity/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: target }),
      });
      setResolvedUser(res.data);
      fetchLastPayment(res.data?.swifyId);
      setStage("amount");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setResolving(false);
    }
  };
 
  // Custom keypad amount builder — mirrors the reference's tap-to-build entry
  // rather than a native number input, so a single decimal point is allowed.
  const handleAmountKeyPress = (key) => {
    setErrorMsg("");
    if (key === ".") {
      if (amount.includes(".")) return;
      setAmount(amount === "" ? "0." : amount + ".");
      return;
    }
    if (amount === "0") {
      setAmount(key);
      return;
    }
    setAmount(amount + key);
  };
 
  const handleAmountBackspace = () => {
    setErrorMsg("");
    setAmount(amount.slice(0, -1));
  };
 
  const goToReview = () => {
    setErrorMsg("");
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMsg("Enter an amount greater than zero.");
      return;
    }
    setStage("review");
  };
 
  const goToMpin = () => {
    setErrorMsg("");
    setPin("");
    setStage("mpin");
  };
 
  const handleKeyPress = (digit) => {
    if (submitting || pin.length >= PIN_LENGTH) return;
    setErrorMsg("");
    setPin(pin + digit);
  };
 
  const handleBackspace = () => {
    if (submitting) return;
    setErrorMsg("");
    setPin(pin.slice(0, -1));
  };
 
  useEffect(() => {
    if (pin.length === PIN_LENGTH && stage === "mpin") {
      submitTransfer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);
 
  const submitTransfer = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      // Step 1: verify MPIN to get a short-lived payment authorisation token
      const mpinRes = await safeFetchJson(`${API_BASE_URL}/mpin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mpin: pin }),
      });
 
      const paymentToken = mpinRes.paymentToken;
 
      // Step 2: submit the actual transfer with that token
      const res = await fetch(`${API_BASE_URL}/transfer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-payment-authorisation": paymentToken,
        },
        credentials: "include",
        body: JSON.stringify({
          receiver: identifier.trim(),
          amount: Number(amount),
          note,
        }),
      });
 
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server didn't return valid JSON. Check the backend is running.");
      }
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Transfer failed. Please try again.");
      }
 
      setTransferResult(data.data);
      setStage("success");
    } catch (err) {
      setErrorMsg(err.message);
      setPin("");
    } finally {
      setSubmitting(false);
    }
  };
 
  // ---------- SUCCESS SCREEN ----------
  if (stage === "success") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#5ee6a8] flex items-center justify-center mb-6">
          <Check size={36} className="text-black" />
        </div>
        <h1 className="text-2xl font-extrabold">Money sent</h1>
        <p className="text-gray-400 text-sm mt-2">
          ₹{formatAmount(amount)} sent to{" "}
          {resolvedUser?.fullName || resolvedUser?.swifyId}
        </p>
        {transferResult?.reference && (
          <p className="text-gray-600 text-xs mt-1 font-mono">
            Ref: {transferResult.reference}
          </p>
        )}
        <div className="flex flex-col gap-3 w-full max-w-xs mt-10">
          <button
            onClick={() => navigate("/home")}
            className="w-full bg-white text-black text-base font-semibold rounded-full py-3 hover:bg-gray-200 transition-colors duration-200"
          >
            Back to Home
          </button>
          <Link
            to="/transactions"
            className="text-sm text-gray-400 underline text-center"
          >
            View transaction
          </Link>
        </div>
      </div>
    );
  }
 
  // ---------- REVIEW STAGE ----------
  if (stage === "review") {
    return (
      <div className="min-h-screen w-full flex flex-col bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <button
            onClick={() => setStage("amount")}
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">Review payment</h1>
          <Link
            to="/home"
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <X size={18} />
          </Link>
        </div>
 
        <div className="h-px bg-[#1a1a1a]" />
 
        {/* Recipient */}
        <div className="flex flex-col items-center pt-10 pb-8">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <span className="text-lg font-bold">{initialsOf(resolvedUser?.fullName)}</span>
          </div>
          <p className="text-gray-500 text-sm mt-3">You're paying</p>
          <p className="text-xl font-bold mt-1">{resolvedUser?.fullName || "Recipient"}</p>
          <p className="text-gray-500 text-sm font-mono mt-0.5">${resolvedUser?.swifyId}</p>
        </div>
 
        {/* Amount */}
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl text-gray-500">₹</span>
          <span className="text-6xl font-bold font-mono tabular-nums">
            {formatAmount(Number(amount) || 0)}
          </span>
        </div>
 
        {/* Details card */}
        <div className="mx-5 mt-10 bg-[#111111] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <span className="text-gray-500 text-sm">To</span>
            <span className="text-sm font-semibold">{resolvedUser?.fullName}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <span className="text-gray-500 text-sm">Pay address</span>
            <span className="text-sm font-mono">{resolvedUser?.payAddress}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <span className="text-gray-500 text-sm">Note</span>
            <span className="text-sm">{note || "—"}</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1a1a1a]">
            <span className="text-gray-500 text-sm">Transfer fee</span>
            <span className="text-sm text-[#5ee6a8]">Free</span>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm font-semibold">Total</span>
            <span className="text-sm font-bold">₹{formatAmount(Number(amount) || 0)}</span>
          </div>
        </div>
 
        <p className="text-center text-gray-600 text-xs mt-6 px-8">
          You'll confirm this payment with your MPIN on the next screen.
        </p>
 
        {errorMsg && <p className="text-red-400 text-sm text-center mt-4 px-5">{errorMsg}</p>}
 
        <div className="flex-1" />
 
        {/* Confirm button */}
        <div className="px-5 pb-8 pt-4">
          <button
            onClick={goToMpin}
            className="w-full bg-white text-black text-lg font-semibold rounded-full py-4 hover:bg-gray-200 transition-colors duration-200"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    );
  }
 
  // ---------- MPIN STAGE ----------
  if (stage === "mpin") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-between bg-black text-white px-6 py-12">
        <div className="w-full flex items-center">
          <button onClick={() => setStage("review")} className="text-gray-400 hover:text-white">
            <ArrowLeft size={22} />
          </button>
        </div>
 
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Enter your MPIN</h1>
          <p className="mt-2 text-gray-400 text-sm">
            Confirm sending ₹{formatAmount(amount)} to{" "}
            {resolvedUser?.fullName || resolvedUser?.swifyId}
          </p>
        </div>
 
        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                  i < pin.length ? "bg-white border-white" : "bg-transparent border-gray-600"
                }`}
              />
            ))}
          </div>
          <p className="text-red-400 text-sm h-5">{errorMsg}</p>
        </div>
 
        <div className="grid grid-cols-3 gap-5 w-full max-w-xs">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              disabled={submitting}
              className="aspect-square rounded-full bg-[#111111] border border-[#222] text-2xl font-semibold flex items-center justify-center hover:border-white active:scale-95 transition-all duration-150 disabled:opacity-50"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={submitting}
            className="aspect-square rounded-full bg-[#111111] border border-[#222] text-2xl font-semibold flex items-center justify-center hover:border-white active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            disabled={submitting}
            className="aspect-square rounded-full flex items-center justify-center text-gray-400 hover:text-white active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            ⌫
          </button>
        </div>
      </div>
    );
  }
 
  // ---------- AMOUNT STAGE ----------
  if (stage === "amount") {
    const numericAmount = Number(amount) || 0;
    const canReview = numericAmount > 0;
    const hasAmount = amount !== "" && amount !== "0";
 
    return (
      <div className="min-h-screen w-full flex flex-col bg-black text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-5">
          <button
            onClick={() => setStage("recipient")}
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold">Send money</h1>
          <Link
            to="/home"
            className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
          >
            <X size={18} />
          </Link>
        </div>
 
        <div className="h-px bg-[#1a1a1a]" />
 
        {/* Recipient row */}
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1a1a1a] flex items-center justify-center shrink-0">
              <span className="text-base font-bold">{initialsOf(resolvedUser?.fullName)}</span>
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">
                {resolvedUser?.fullName || "Recipient"}
              </p>
              <p className="text-sm text-gray-500 font-mono mt-0.5">
                ${resolvedUser?.swifyId}
                {lastPayment && (
                  <>
                    {" "}· Paid ₹{formatAmount(lastPayment.amount)} ·{" "}
                    {lastPayment.daysAgo === 0
                      ? "today"
                      : lastPayment.daysAgo === 1
                      ? "1 day ago"
                      : `${lastPayment.daysAgo} days ago`}
                  </>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setStage("recipient")}
            className="flex items-center gap-0.5 text-base font-semibold text-gray-300 hover:text-white transition-colors duration-200 shrink-0"
          >
            Change
            <ChevronRight size={18} />
          </button>
        </div>
 
        <div className="h-px bg-[#1a1a1a]" />
 
        {/* Amount display */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 min-h-[220px]">
          <div className="flex items-center gap-2">
            <span className={`text-3xl ${hasAmount ? "text-gray-500" : "text-gray-700"}`}>₹</span>
            <span
              className={`text-7xl font-bold font-mono tabular-nums ${
                hasAmount ? "text-white" : "text-gray-700"
              }`}
            >
              {amount || "0"}
            </span>
            <span className="w-0.5 h-11 bg-white animate-pulse ml-1" />
          </div>
          <p className="text-gray-500 text-sm mt-5">
            Balance ₹{walletBalance !== null ? formatAmount(walletBalance) : "—"}
          </p>
        </div>
 
        {/* Note + quick chips */}
        <div className="px-5 pb-2">
          <div className="flex items-center gap-3 bg-[#111111] hover:bg-[#161616] focus-within:bg-[#161616] transition-colors duration-200 rounded-full px-5 py-4">
            <Pencil size={16} className="text-gray-500 shrink-0" />
            <input
              type="text"
              placeholder="What's it for?"
              maxLength={100}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-transparent text-white text-base outline-none placeholder:text-gray-400"
            />
          </div>
 
          <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
            {noteChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setNote(note === chip ? "" : chip)}
                className={`shrink-0 text-sm px-4 py-2 rounded-full border transition-colors duration-200 ${
                  note === chip
                    ? "bg-white text-black border-white font-semibold"
                    : "bg-[#111111] text-gray-400 border-[#222] hover:border-gray-500"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
 
        {errorMsg && <p className="text-red-400 text-sm text-center mt-3 px-5">{errorMsg}</p>}
        {!errorMsg && <div className="mt-6" />}
 
        {/* Keypad */}
        <div className="grid grid-cols-3 border-t border-[#1a1a1a]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key, i) => (
            <button
              key={i}
              onClick={() =>
                key === "back" ? handleAmountBackspace() : handleAmountKeyPress(key)
              }
              className={`h-[76px] flex items-center justify-center text-3xl font-semibold border-[#1a1a1a] hover:bg-[#0d0d0d] active:bg-[#151515] transition-colors duration-150 ${
                (i + 1) % 3 !== 0 ? "border-r" : ""
              } ${i < 9 ? "border-b" : ""}`}
            >
              {key === "back" ? <Delete size={22} className="text-gray-400" /> : key}
            </button>
          ))}
        </div>
 
        {/* Review button */}
        <button
          onClick={goToReview}
          disabled={!canReview}
          className={`w-full py-5 text-lg font-semibold transition-colors duration-200 ${
            canReview
              ? "bg-white text-black hover:bg-gray-200"
              : "bg-[#161616] text-gray-600 cursor-not-allowed"
          }`}
        >
          Review
        </button>
      </div>
    );
  }
 
  // ---------- RECIPIENT STAGE (default) ----------
  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white px-5 py-6">
      <div className="flex items-center gap-4">
        <Link to="/home" className="text-gray-400 hover:text-white">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="text-lg font-bold">Send money</h1>
      </div>
 
      <p className="mt-8 text-gray-400 text-sm">
        Enter a Swify ID, phone number, or pay address.
      </p>
 
      <div className="mt-4 bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
        <label className="text-gray-500 text-sm">To</label>
        <input
          type="text"
          placeholder="$swifyid, phone, or pay address"
          autoComplete="off"
          autoFocus
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleResolve()}
          className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600"
        />
      </div>
 
      {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
 
      <button
        onClick={() => handleResolve()}
        disabled={resolving || !identifier.trim()}
        className="w-full bg-white text-black text-lg font-semibold rounded-full py-4 mt-6 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
      >
        {resolving ? "Looking up…" : "Continue"}
      </button>
    </div>
  );
}