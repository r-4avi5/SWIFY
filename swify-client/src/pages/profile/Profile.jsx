import { useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence } from "framer-motion";
import { ShieldCheck, KeyRound, Copy, Mail, Phone } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { initials } from "../../lib/format";
import "./Profile.css";

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

      <div className="profile">
        <div className="profile__card">
          <div className="profile__identity">
            <span className="profile__avatar">{initials(user?.fullName || user?.displayName || "")}</span>
            <div>
              <p className="profile__name">{user?.fullName}</p>
              <p className="profile__handle mono">@{user?.swifyId}</p>
            </div>
            <StatusBadge tone={user?.isMpinSet ? "success" : "warning"}>
              {user?.isMpinSet ? "MPIN active" : "MPIN not set"}
            </StatusBadge>
          </div>

          <div className="profile__contact">
            <span><Mail size={14} /> {user?.email}</span>
            <span><Phone size={14} /> {user?.phone}</span>
          </div>

          <div className="profile__qr">
            <QRCodeSVG value={JSON.stringify({ payAddress: user?.payAddress })} size={132} bgColor="transparent" fgColor="#f4f2ec" />
            <button className="profile__pay-address mono" onClick={copy}>
              {user?.payAddress}
              <Copy size={12} />
            </button>
            {copied ? <span className="profile__copied">Copied</span> : null}
          </div>
        </div>

        <div className="profile__links">
          <Link to="/kyc" className="profile__link">
            <span className="profile__link-icon"><ShieldCheck size={17} /></span>
            <span>
              <strong>Identity verification</strong>
              <small>Submit Aadhaar &amp; PAN for higher limits</small>
            </span>
          </Link>
          <Link to="/mpin" className="profile__link">
            <span className="profile__link-icon"><KeyRound size={17} /></span>
            <span>
              <strong>{user?.isMpinSet ? "Change MPIN" : "Set up MPIN"}</strong>
              <small>Required before you can send money</small>
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
