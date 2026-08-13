import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
 
// Point this at your actual API base URL.
// If your frontend and backend run on different ports (e.g. Vite on 5173,
// Express on 3000), a relative "/api" will NOT reach your backend — it'll
// hit the frontend dev server instead and return HTML, which is what causes
// "Unexpected token < in JSON" / "Unexpected end of JSON input" errors.
// Set this to your backend's actual URL, e.g. "http://localhost:3000/api"
 
// Checks the freshly-registered user's onboarding progress and returns
// wherever they should land next: KYC (if not yet submitted/verified),
// MPIN setup (if not set), or Home if both are done.
async function resolveNextRoute() {
  try {
    const [profileRes, kycRes] = await Promise.all([
      fetch(`${API_BASE_URL}/user/profile`, { credentials: "include" }).then((r) => r.json()),
      fetch(`${API_BASE_URL}/kyc/status`, { credentials: "include" }).then((r) => r.json()),
    ]);
 
    const kycStatus = kycRes?.data?.status;
    const isMpinSet = profileRes?.data?.isMpinSet;
 
    if (kycStatus === "PENDING" || kycStatus === "NOT_SUBMITTED" || kycStatus === "REJECTED") {
      return "/kyc";
    }
    if (!isMpinSet) {
      return "/mpin-setup";
    }
    return "/home";
  } catch {
    return "/kyc"; // safest default right after registration
  }
}
 
export default function SwifySignup() {
  const navigate = useNavigate();
 
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
 
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [swifyId, setSwifyId] = useState("");
 
  const [avatarPreview, setAvatarPreview] = useState(null); // base64, sent as `avatar`
  const fileInputRef = useRef(null);
 
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
 
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result); // data:image/...;base64,....
    reader.readAsDataURL(file);
  };
 
  const initials =
    fullName
      .trim()
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0]?.toUpperCase())
      .join("") || "";
 
  const handleSubmit = async () => {
    setErrorMsg("");
 
    if (!agreed) {
      setErrorMsg("Please agree to the Terms and Privacy Policy.");
      return;
    }
    if (displayName.length > 12) {
      setErrorMsg("Display name must be 12 characters or fewer.");
      return;
    }
 
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // backend sets an httpOnly cookie on login; harmless here
        body: JSON.stringify({
          fullName,
          email,
          phone,
          password,
          swifyId: swifyId.toLowerCase(),
          displayName,
          avatar: avatarPreview || "",
        }),
      });
 
      // Read the raw text first — if the server ever returns HTML (e.g. a
      // 404 page, a proxy error page, or an unhandled crash), res.json()
      // would throw a confusing "Unexpected token" error. Reading as text
      // first lets us give a clear message instead of a JSON parse crash.
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          "Server didn't return valid JSON. Check that the backend is running and API_BASE_URL is correct."
        );
      }
 
      if (!res.ok || !data.success) {
        // Backend throws things like "Swify ID already exists",
        // "Email already exists", "Phone number already exists"
        throw new Error(data.message || "Something went wrong. Please try again.");
      }
 
      // Registration succeeded — route to whichever onboarding step
      // (KYC or MPIN) is still incomplete.
      navigate(await resolveNextRoute());
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
          Create your Swify account
        </h1>
      </div>
 
      {/* Profile photo */}
      <div className="flex items-center gap-4 mt-8">
        <div className="w-20 h-20 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center overflow-hidden">
          {avatarPreview ? (
            <img src={avatarPreview} alt="Profile avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-2xl font-bold">{initials}</span>
          )}
        </div>
        <div>
          <p className="font-semibold text-base">Profile photo</p>
          <div className="flex items-center gap-3 mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-white text-black text-base font-semibold px-6 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200"
            >
              Upload
            </button>
          </div>
        </div>
      </div>
 
      {/* Your details */}
      <p className="mt-10 text-gray-500 text-sm tracking-[0.15em]">YOUR DETAILS</p>
 
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm">Full name</label>
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            autoComplete="off"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600"
          />
        </div>
 
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm">Email</label>
          <input
            type="email"
            name="signup-email"
            placeholder="Email"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600"
          />
        </div>
 
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm block text-center">Mobile number</label>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-lg">+91 ▾</span>
            <span className="text-gray-700">|</span>
            <input
              type="tel"
              name="phone"
              placeholder="Mobile number"
              autoComplete="off"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-gray-600"
            />
          </div>
        </div>
 
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <div className="flex justify-between items-center">
            <label className="text-gray-500 text-sm">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white text-sm font-semibold underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="new-password"
            placeholder="Password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none tracking-widest placeholder:text-gray-600 placeholder:tracking-normal"
          />
        </div>
      </div>
 
      {/* Public profile */}
      <div className="flex items-center justify-between mt-10">
        <p className="text-gray-500 text-sm tracking-[0.15em]">PUBLIC PROFILE</p>
        <p className="text-gray-500 text-sm">Visible to senders</p>
      </div>
 
      <div className="mt-4 flex flex-col gap-3">
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <div className="flex justify-between items-center">
            <label className="text-gray-500 text-sm">Display name</label>
            <span className="text-gray-600 text-xs">{displayName.length}/12</span>
          </div>
          <input
            type="text"
            name="displayName"
            placeholder="Display name"
            autoComplete="off"
            maxLength={12}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-transparent text-white text-lg mt-1 outline-none placeholder:text-gray-600"
          />
        </div>
 
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-sm">Swify ID</label>
          <div className="flex items-center mt-1">
            <input
              type="text"
              name="swifyId"
              placeholder="Your SwifyID"
              autoComplete="off"
              value={swifyId}
              onChange={(e) =>
                setSwifyId(e.target.value.toLowerCase())
              }
              className="flex-1 bg-transparent text-white text-lg font-semibold outline-none placeholder:text-gray-600 placeholder:font-normal"
            />
          </div>
        </div>
      </div>
 
      {/* Error message from backend */}
      {errorMsg && (
        <p className="mt-4 text-red-400 text-sm text-center">{errorMsg}</p>
      )}
 
      {/* Terms */}
      <label className="flex items-start gap-3 mt-6 text-sm text-gray-400">
        <input
          type="checkbox"
          checked={agreed}
          onChange={() => setAgreed(!agreed)}
          className="w-5 h-5 mt-0.5 rounded accent-white"
        />
        <span>
          I agree to Swify's <span className="underline font-semibold text-white">Terms</span> and{" "}
          <span className="underline font-semibold text-white">Privacy Policy</span>.
        </span>
      </label>
 
      {/* CTA */}
      <div className="mt-12 flex flex-col gap-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-white text-black text-xl font-semibold rounded-full py-4 flex justify-center items-center hover:bg-gray-200 transition-colors duration-200 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
        <p className="text-center text-base text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-white font-semibold underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}