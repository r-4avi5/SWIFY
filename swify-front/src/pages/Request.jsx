import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import QRCode from "qrcode";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";
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
 
export default function SwifyRequest() {
  const navigate = useNavigate();
 
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
 
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [qrImage, setQrImage] = useState(null);
  const [copied, setCopied] = useState(false);
 
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/user/profile`)
      .then((res) => setProfile(res.data))
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, []);
 
  // Regenerate the QR whenever amount/note/payAddress changes
  useEffect(() => {
    if (!profile?.payAddress) return;
 
    const numericAmount = Number(amount) || 0;
    const payload = JSON.stringify({
      version: 1,
      type: "REQUEST",
      payAddress: profile.payAddress,
      displayName: profile.displayName,
      ...(numericAmount > 0 ? { amount: numericAmount } : {}),
      ...(note.trim() ? { note: note.trim() } : {}),
    });
 
    QRCode.toDataURL(payload, {
      width: 400,
      margin: 1,
      color: { dark: "#000000", light: "#ffffff" },
    })
      .then(setQrImage)
      .catch(() => setQrImage(null));
  }, [profile, amount, note]);
 
  const handleCopyLink = () => {
    if (!profile?.payAddress) return;
    const numericAmount = Number(amount) || 0;
    const text = numericAmount > 0
      ? `Pay me ₹${numericAmount} on Swify: ${profile.payAddress}`
      : `Pay me on Swify: ${profile.payAddress}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
 
  const handleShare = async () => {
    if (!navigator.share || !profile?.payAddress) {
      handleCopyLink();
      return;
    }
    const numericAmount = Number(amount) || 0;
    try {
      await navigator.share({
        title: "Swify payment request",
        text:
          numericAmount > 0
            ? `Pay me ₹${numericAmount} on Swify: ${profile.payAddress}`
            : `Pay me on Swify: ${profile.payAddress}`,
      });
    } catch {
      // user cancelled share sheet — no-op
    }
  };
 
  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6">
        <button
          onClick={() => navigate("/home")}
          className="w-11 h-11 rounded-2xl bg-[#161616] flex items-center justify-center hover:bg-[#222] transition-colors duration-200"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold">Request money</h1>
      </div>
 
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
        </div>
      ) : errorMsg && !profile ? (
        <p className="text-red-400 text-sm text-center mt-10 px-5">{errorMsg}</p>
      ) : (
        <>
          {/* Amount entry */}
          <div className="flex flex-col items-center mt-8 px-5">
            <div className="flex items-center gap-2">
              <span className={`text-2xl ${amount ? "text-gray-400" : "text-gray-700"}`}>₹</span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, "");
                  setAmount(v);
                }}
                className="bg-transparent text-5xl font-bold font-mono outline-none w-40 text-center placeholder:text-gray-700"
              />
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Leave blank to let the payer choose an amount
            </p>
 
            <input
              type="text"
              placeholder="Add a note (optional)"
              maxLength={100}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full max-w-xs bg-[#111111] rounded-full px-5 py-3 mt-4 text-sm text-center outline-none placeholder:text-gray-600"
            />
          </div>
 
          {/* QR code */}
          <div className="flex flex-col items-center mt-8">
            <div className="bg-white rounded-3xl p-5">
              {qrImage ? (
                <img src={qrImage} alt="Your Swify request QR" className="w-56 h-56" />
              ) : (
                <div className="w-56 h-56 bg-gray-100 animate-pulse rounded-xl" />
              )}
            </div>
            <p className="text-white font-bold mt-4">{profile?.displayName}</p>
            <p className="text-gray-500 text-sm font-mono">{profile?.payAddress}</p>
          </div>
 
          {/* Actions */}
          <div className="flex-1" />
          <div className="px-5 pb-8 pt-6 flex gap-3">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 bg-[#111111] rounded-full py-4 font-semibold hover:bg-[#1a1a1a] transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check size={18} className="text-[#5ee6a8]" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 bg-white text-black rounded-full py-4 font-semibold hover:bg-gray-200 transition-colors duration-200"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>
        </>
      )}
    </div>
  );
}