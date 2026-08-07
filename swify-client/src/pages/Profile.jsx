import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ShieldCheck, KeyRound, Copy, Mail, Phone } from "lucide-react";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import { initials } from "../utils/format";

export default function Profile() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(user?.payAddress || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <Topbar title="Profile" subtitle="Your identity on Swify." />

      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[480px] flex flex-col gap-[18px]">
        <div className="bg-panel border border-hairline rounded-3xl p-[26px] flex flex-col gap-5">
          <div className="flex items-center gap-3.5">
            <span className="w-[52px] h-[52px] rounded-full bg-panel-2 grid place-items-center font-extrabold text-base text-brass-soft shrink-0">
              {initials(user?.fullName || user?.displayName || "")}
            </span>
            <div className="flex-1 min-w-0">
              <p className="m-0 font-extrabold text-[1.05rem]">{user?.fullName}</p>
              <p className="m-[2px_0_0] text-[0.8rem] text-slate font-mono">@{user?.swifyId}</p>
            </div>
            <StatusBadge tone={user?.isMpinSet ? "success" : "warning"}>
              {user?.isMpinSet ? "MPIN active" : "MPIN not set"}
            </StatusBadge>
          </div>

          <div className="flex flex-col gap-2 text-[0.85rem] text-slate pt-4 border-t border-hairline">
            <span className="flex items-center gap-2">
              <Mail size={14} /> {user?.email}
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} /> {user?.phone}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 pt-[18px] border-t border-hairline">
            <QRCodeSVG
              value={JSON.stringify({ payAddress: user?.payAddress })}
              size={132}
              bgColor="transparent"
              fgColor="#f4f2ec"
            />
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 bg-panel-2 border border-hairline rounded-full px-3.5 py-1.5 text-[0.8rem] text-ivory font-mono cursor-pointer hover:border-brass"
            >
              {user?.payAddress}
              <Copy size={12} />
            </button>
            {copied ? <span className="text-[0.74rem] text-signal font-bold">Copied</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Link
            to="/kyc"
            className="flex items-center gap-3.5 px-[18px] py-4 rounded-2xl bg-panel border border-hairline text-ivory hover:border-brass"
          >
            <span className="w-[38px] h-[38px] rounded-full bg-panel-2 text-brass-soft grid place-items-center shrink-0">
              <ShieldCheck size={17} />
            </span>
            <span className="flex flex-col gap-0.5">
              <strong>Identity verification</strong>
              <small className="text-slate text-[0.78rem] font-medium">Submit Aadhaar &amp; PAN for higher limits</small>
            </span>
          </Link>
          <Link
            to="/mpin"
            className="flex items-center gap-3.5 px-[18px] py-4 rounded-2xl bg-panel border border-hairline text-ivory hover:border-brass"
          >
            <span className="w-[38px] h-[38px] rounded-full bg-panel-2 text-brass-soft grid place-items-center shrink-0">
              <KeyRound size={17} />
            </span>
            <span className="flex flex-col gap-0.5">
              <strong>{user?.isMpinSet ? "Change MPIN" : "Set up MPIN"}</strong>
              <small className="text-slate text-[0.78rem] font-medium">Required before you can send money</small>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
