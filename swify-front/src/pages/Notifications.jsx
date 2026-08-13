import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
 
const PIN_LENGTH = 6;
 
export default function SwifyMpinSetup() {
  const navigate = useNavigate();
 
  const [stage, setStage] = useState("create"); // "create" | "confirm"
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [shake, setShake] = useState(false);
  const [submitting, setSubmitting] = useState(false);
 
  const activeValue = stage === "create" ? pin : confirmPin;
  const setActiveValue = stage === "create" ? setPin : setConfirmPin;
 
  const handleKeyPress = (digit) => {
    if (submitting) return;
    if (activeValue.length >= PIN_LENGTH) return;
    setErrorMsg("");
    setActiveValue(activeValue + digit);
  };
 
  const handleBackspace = () => {
    if (submitting) return;
    setErrorMsg("");
    setActiveValue(activeValue.slice(0, -1));
  };
 
  const triggerShake = (message) => {
    setErrorMsg(message);
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };
 
  // Once 6 digits are entered, either move to confirm stage or submit
  useEffect(() => {
    if (activeValue.length !== PIN_LENGTH) return;
 
    if (stage === "create") {
      const t = setTimeout(() => setStage("confirm"), 200);
      return () => clearTimeout(t);
    }
 
    if (stage === "confirm") {
      if (confirmPin !== pin) {
        triggerShake("PINs don't match. Try again.");
        const t = setTimeout(() => {
          setPin("");
          setConfirmPin("");
          setStage("create");
        }, 500);
        return () => clearTimeout(t);
      }
      submitMpin();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeValue]);
 
  const submitMpin = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/mpin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mpin: pin }),
      });
 
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error("Server didn't return valid JSON. Check the backend is running.");
      }
 
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Couldn't set MPIN. Please try again.");
      }
 
      navigate("/home");
    } catch (err) {
      triggerShake(err.message);
      setPin("");
      setConfirmPin("");
      setStage("create");
    } finally {
      setSubmitting(false);
    }
  };
 
  const title = stage === "create" ? "Set your MPIN" : "Confirm your MPIN";
  const subtitle =
    stage === "create"
      ? "Choose a 6-digit PIN to authorise payments."
      : "Enter the same PIN again to confirm.";
 
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between bg-black text-white px-6 py-12">
      {/* Heading */}
      <div className="text-center mt-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-4 text-gray-400 text-sm">{subtitle}</p>
      </div>
 
      {/* PIN dots */}
      <div className="flex flex-col mt-5 items-center gap-4">
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
 
        {errorMsg && (
          <p className="text-red-400 text-sm h-5">{errorMsg}</p>
        )}
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
 
      {/* Keypad */}
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
 
        {/* Empty cell for grid alignment */}
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