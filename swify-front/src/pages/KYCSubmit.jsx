import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
 
 
const AADHAAR_REGEX = /^\d{12}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
 
function DocUploadTile({ label, preview, onChange }) {
  const inputRef = useRef(null);
 
  return (
    <div className="bg-[#111111] border border-[#222] hover:border-white transition-colors duration-200 rounded-2xl px-4 py-4 flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden shrink-0">
        {preview ? (
          <img src={preview} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-600 text-xs text-center px-1">No file</span>
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-gray-500 text-xs mt-0.5">
          {preview ? "Selected — tap to change" : "JPG or PNG, clear photo"}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
      >
        {preview ? "Change" : "Upload"}
      </button>
    </div>
  );
}
 
export default function SwifyKYC() {
  const navigate = useNavigate();
 
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
 
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [panCard, setPanCard] = useState(null);
  const [selfie, setSelfie] = useState(null);
 
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
 
  // Resizes and compresses an image via canvas before base64-encoding it,
  // so four full-resolution phone photos don't blow past the request size
  // limit (or worse, get silently dropped mid-upload).
  const compressAndReadAsBase64 = (file, setter) => {
    if (!file || !file.type.startsWith("image/")) return;
 
    const img = new Image();
    const reader = new FileReader();
 
    reader.onload = () => {
      img.onload = () => {
        const MAX_DIMENSION = 1280;
        let { width, height } = img;
 
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
 
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
 
        // JPEG at 0.75 quality keeps ID photos legible while cutting
        // file size dramatically compared to raw camera output.
        setter(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = reader.result;
    };
 
    reader.readAsDataURL(file);
  };
 
  const handleSubmit = async () => {
    setErrorMsg("");
 
    if (!AADHAAR_REGEX.test(aadhaarNumber)) {
      setErrorMsg("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!PAN_REGEX.test(panNumber.toUpperCase())) {
      setErrorMsg("Enter a valid PAN number (e.g. ABCDE1234F).");
      return;
    }
    if (!aadharFront || !aadharBack || !panCard || !selfie) {
      setErrorMsg("Please upload all four documents.");
      return;
    }
 
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // sends the httpOnly auth cookie set at login
        body: JSON.stringify({
          aadharNumber: aadhaarNumber,
          panNumber: panNumber.toUpperCase(),
          aadharFront,
          aadharBack,
          panCard,
          selfie,
        }),
      });
 
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "Server didn't return valid JSON. Check that the backend is running."
        );
      }
 
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
 
      // KYC submitted (now UNDER_REVIEW) — MPIN setup is the next
      // actionable onboarding step. A dedicated "pending review" screen
      // can replace this once built.
      navigate("/mpin-setup");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="min-h-screen w-full flex flex-col bg-black text-white px-5 py-8">
 
      {/* Heading */}
      <div>
        <h1 className="text-4xl font-extrabold leading-tight">
          Verify your identity
        </h1>
        <p className="mt-2 text-gray-400 text-base">
          Required once — takes about 2 minutes.
        </p>
      </div>
 
      {/* ID numbers */}
      <p className="mt-10 text-gray-500 text-sm tracking-[0.15em]">ID DETAILS</p>
 
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm">Aadhaar number</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="12-digit number"
            autoComplete="off"
            maxLength={12}
            value={aadhaarNumber}
            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600 tracking-widest"
          />
        </div>
 
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm">PAN number</label>
          <input
            type="text"
            placeholder="ABCDE1234F"
            autoComplete="off"
            maxLength={10}
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600 tracking-widest uppercase"
          />
        </div>
      </div>
 
      {/* Documents */}
      <p className="mt-10 text-gray-500 text-sm tracking-[0.15em]">DOCUMENTS</p>
 
      <div className="mt-4 flex flex-col gap-3">
        <DocUploadTile
          label="Aadhaar — front"
          preview={aadharFront}
          onChange={(e) => compressAndReadAsBase64(e.target.files?.[0], setAadharFront)}
        />
        <DocUploadTile
          label="Aadhaar — back"
          preview={aadharBack}
          onChange={(e) => compressAndReadAsBase64(e.target.files?.[0], setAadharBack)}
        />
        <DocUploadTile
          label="PAN card"
          preview={panCard}
          onChange={(e) => compressAndReadAsBase64(e.target.files?.[0], setPanCard)}
        />
        <DocUploadTile
          label="Selfie"
          preview={selfie}
          onChange={(e) => compressAndReadAsBase64(e.target.files?.[0], setSelfie)}
        />
      </div>
 
      {/* Error message from backend */}
      {errorMsg && (
        <p className="mt-4 text-red-400 text-sm text-center">{errorMsg}</p>
      )}
 
      {/* Privacy note */}
      <p className="mt-6 text-gray-500 text-xs text-center">
        Your documents are encrypted and only used for identity verification,
        as required under RBI KYC guidelines.
      </p>
 
      {/* CTA */}
      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-white text-black text-xl font-semibold rounded-full py-4 flex justify-center items-center hover:bg-gray-200 transition-colors duration-200 disabled:opacity-60"
        >
          {submitting ? "Submitting…" : "Submit for verification"}
        </button>
        <Link
          to="/home"
          className="text-center text-sm text-gray-400 underline"
        >
          I'll do this later
        </Link>
      </div>
    </div>
  );
}