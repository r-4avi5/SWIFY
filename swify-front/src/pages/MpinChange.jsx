import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
 
export default function SwifyMpinChange() {
  const navigate = useNavigate();
 
  // step: "checking" | "not_set" | "old" | "new" | "confirm"
  const [step, setStep] = useState("checking");
  const [oldMpin, setOldMpin] = useState("");
  const [newMpin, setNewMpin] = useState("");
  const [confirmMpin, setConfirmMpin] = useState("");
 
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
 
  // Changing an MPIN only makes sense if one already exists —
  // check the real profile first rather than assuming.
  useEffect(() => {
    safeFetchJson(`${API_BASE_URL}/user/profile`)
      .then((res) => {
        setStep(res.data?.isMpinSet ? "old" : "not_set");
      })
      .catch(() => setStep("old")); // fail open rather than trap the user
  }, []);
 
  const activeValue = step === "old" ? oldMpin : step === "new" ? newMpin : confirmMpin;
  const setActiveValue = step === "old" ? setOldMpin : step === "new" ? setNewMpin : setConfirmMpin;
 
  const triggerShake = (message) => {
    setErrorMsg(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };
 
  const handleKeyPress = (digit) => {
    if (submitting || activeValue.length >= PIN_LENGTH) return;
    setErrorMsg("");
    setActiveValue(activeValue + digit);
  };
 
  const handleBackspace = () => {
    if (submitting) return;
    setErrorMsg("");
    setActiveValue(activeValue.slice(0, -1));
  };
 
  useEffect(() => {
    if (activeValue.length !== PIN_LENGTH) return;
 
    if (step === "old") {
      const t = setTimeout(() => setStep("new"), 200);
      return () => clearTimeout(t);
    }
 
    if (step === "new") {
      if (newMpin === oldMpin) {
        triggerShake("New MPIN must be different from the old one.");
        const t = setTimeout(() => setNewMpin(""), 500);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setStep("confirm"), 200);
      return () => clearTimeout(t);
    }
 
    if (step === "confirm") {
      if (confirmMpin !== newMpin) {
        triggerShake("MPINs don't match. Try again.");
        const t = setTimeout(() => {
          setNewMpin("");
          setConfirmMpin("");
          setStep("new");
        }, 500);
        return () => clearTimeout(t);
      }
      submitChange();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeValue]);
 
  const submitChange = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await safeFetchJson(`${API_BASE_URL}/mpin/change`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldMpin, newMpin }),
      });
      setSuccess(true);
    } catch (err) {
      triggerShake(err.message);
      setOldMpin("");
      setNewMpin("");
      setConfirmMpin("");
      setStep("old");
    } finally {
      setSubmitting(false);
    }
  };
 
  // ---------- Loading real profile status ----------
  if (step === "checking") {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black text-white">
        <div className="w-8 h-8 border-2 border-gray-700 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
 
  // ---------- No MPIN set yet — send to setup instead ----------
  if (step === "not_set") {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <h1 className="text-2xl font-extrabold">No MPIN set yet</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
          You haven't set up an MPIN yet. Set one up first to secure your payments.
        </p>
        <Link
          to="/mpin-setup"
          className="w-full max-w-xs bg-white text-black text-base font-semibold rounded-full py-3 mt-8 hover:bg-gray-200 transition-colors duration-200"
        >
          Set up MPIN
        </Link>
        <Link to="/profile" className="text-gray-500 text-sm underline mt-4">
          Go back
        </Link>
      </div>
    );
  }
 
  // ---------- Success ----------
  if (success) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-[#5ee6a8] flex items-center justify-center mb-6">
          <span className="text-black text-3xl font-bold">✓</span>
        </div>
        <h1 className="text-2xl font-extrabold">MPIN updated</h1>
        <p className="text-gray-400 text-sm mt-2">
          Your new MPIN will be used for all payments going forward.
        </p>
        <button
          onClick={() => navigate("/profile")}
          className="w-full max-w-xs bg-white text-black text-base font-semibold rounded-full py-3 mt-10 hover:bg-gray-200 transition-colors duration-200"
        >
          Done
        </button>
      </div>
    );
  }
 
  const titles = {
    old: "Enter current MPIN",
    new: "Choose a new MPIN",
    confirm: "Confirm new MPIN",
  };
  const subtitles = {
    old: "Verify it's you before making changes.",
    new: "Pick a 6-digit PIN different from your old one.",
    confirm: "Enter the same new PIN again to confirm.",
  };
 
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-black text-white px-6 py-12">
      <div className="w-full flex items-center">
        <button
          onClick={() => navigate("/profile")}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft size={22} />
        </button>
      </div>
 
      {/* Step indicator */}
      <div className="flex gap-2">
        {["old", "new", "confirm"].map((s) => (
          <div
            key={s}
            className={`h-1 w-8 rounded-full transition-colors duration-200 ${
              s === step ? "bg-white" : "bg-gray-800"
            }`}
          />
        ))}
      </div>
 
      <div className="text-center">
        <h1 className="text-2xl font-extrabold">{titles[step]}</h1>
        <p className="mt-2 text-gray-400 text-sm">{subtitles[step]}</p>
      </div>
 
      <div className="flex flex-col items-center gap-4">
        <div className={`flex gap-4 ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors duration-150 ${
                i < activeValue.length
                  ? "bg-white border-white"
                  : "bg-transparent border-gray-600"
              }`}
            />
          ))}
        </div>
 
        {errorMsg && <p className="text-red-400 text-sm h-5">{errorMsg}</p>}
        {!errorMsg && <div className="h-5" />}
 
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>
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