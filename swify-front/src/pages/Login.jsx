import { useState } from "react";
import { Link } from "react-router-dom";
 
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
 
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
          <label className="text-gray-500 text-xs">Email or phone</label>
          <input
            type="text"
            defaultValue="ravi@swify.app"
            className="w-full bg-transparent text-white text-base mt-1 outline-none"
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
            defaultValue="password"
            className="w-full bg-transparent text-white text-base mt-1 outline-none tracking-widest"
          />
        </div>
 
        {/* Keep signed in / Forgot */}
        <div className="flex items-center justify-between mt-1 px-1">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" className="w-4 h-4 rounded accent-white" />
            Keep me signed in
          </label>
          <span className="text-sm font-semibold underline">Forgot?</span>
        </div>
      </div>
 
      {/* Buttons */}
      <div className="mt-5 flex flex-col gap-4">
        <Link
          to="/dashboard"
          className="w-full bg-white text-black text-lg font-semibold rounded-full py-3 flex justify-center items-center"
        >
          Log in
        </Link>
 
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-500 text-xs">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>
 
        <div className="flex gap-3">
          <button className="flex-1 bg-[#111111] border border-[#222] outline-none focus:outline-none hover:border-white active:border-white transition-colors duration-200 rounded-2xl py-3 font-semibold">
            Google
          </button>
          <button className="flex-1 bg-[#111111] border border-[#222] outline-none focus:outline-none hover:border-white active:border-white transition-colors duration-200 rounded-2xl py-3 font-semibold">
            Apple
          </button>
        </div>
 
        <label className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-1">
          <input type="checkbox" className="w-3.5 h-3.5 rounded" />
          Face ID enabled on this device
        </label>
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