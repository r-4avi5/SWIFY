import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../config";
 
 
// Checks the freshly-authenticated user's onboarding progress and returns
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
    // If either check fails for some reason, don't block login/signup —
    // fall back to Home rather than trapping the user.
    return "/home";
  }
}
 
export default function SwifyLogin() {
  const navigate = useNavigate();
 
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
 
  const handleLogin = async () => {
    setErrorMsg("");
 
    if (!email.trim() || !password) {
      setErrorMsg("Enter your email and password.");
      return;
    }
 
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // required so the httpOnly token cookie gets stored
        body: JSON.stringify({ email: email.trim(), password }),
      });
 
      // Read as text first so a non-JSON response (HTML error page, empty
      // body, etc.) doesn't throw a confusing "Unexpected end of JSON input".
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
        // Backend throws "Invalid email or password" on bad credentials
        throw new Error(data.message || "Login failed. Please try again.");
      }
 
      navigate(await resolveNextRoute());
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };
 
  return (
    <div className="h-screen w-full flex flex-col justify-between bg-black text-white px-5 py-6 overflow-hidden">
 
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center">
            <span className="text-black text-xl font-bold">S</span>
          </div>
          <span className="text-lg font-semibold">swify</span>
        </div>
        <span className="text-gray-400 text-sm">Help</span>
      </div>
 
      {/* Heading */}
      <div className="mt-6">
        <h1 className="text-4xl font-extrabold leading-tight">Welcome back</h1>
        <p className="mt-2 text-gray-400 text-sm">
          Log in to send, request and track money.
        </p>
      </div>
 
      {/* Form */}
      <div className="mt-6 flex flex-col gap-3">
        {/* Email */}
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <label className="text-gray-500 text-xs">Email</label>
          <input
            type="email"
            name="login-email"
            placeholder="you@example.com"
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent text-white text-base mt-1 outline-none placeholder:text-gray-600"
          />
        </div>
 
        {/* Password */}
        <div className="bg-[#111111] border border-[#222] hover:border-white focus-within:border-white transition-colors duration-200 rounded-2xl px-4 py-3">
          <div className="flex justify-between items-center">
            <label className="text-gray-500 text-xs">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white text-xs font-semibold underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            type={showPassword ? "text" : "password"}
            name="login-password"
            placeholder="Password"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            className="w-full bg-transparent text-white text-base mt-1 outline-none tracking-widest placeholder:text-gray-600 placeholder:tracking-normal"
          />
        </div>
      </div>
 
      {/* Error message */}
      {errorMsg && (
        <p className="text-red-400 text-sm text-center mt-2">{errorMsg}</p>
      )}
 
      {/* Buttons */}
      <div className="mt-5 flex flex-col gap-4">
        <button
          type="button"
          onClick={handleLogin}
          disabled={submitting}
          className="w-full bg-white text-black text-lg font-semibold rounded-full py-3 flex justify-center items-center hover:bg-gray-200 transition-colors duration-200 disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </div>
 
      {/* Footer */}
      <div className="border-t border-gray-800 pt-4 text-center text-sm text-gray-400">
        New to Swify?{" "}
        <Link to="/register" className="text-white font-semibold underline">
          Create account
        </Link>
      </div>
    </div>
  );
}