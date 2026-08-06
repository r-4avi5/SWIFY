import { QRCodeSVG } from "qrcode.react";
import { X, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import "./ReceiveModal.css";

export default function ReceiveModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const payload = JSON.stringify({ payAddress: user?.payAddress });

  const copy = () => {
    navigator.clipboard.writeText(user?.payAddress || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="receive-modal__backdrop" onClick={onClose}>
      <motion.div
        className="receive-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button className="receive-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <p className="receive-modal__eyebrow">Receive money</p>
        <h3 className="receive-modal__title">Scan to pay {user?.displayName}</h3>

        <div className="receive-modal__qr">
          <QRCodeSVG value={payload} size={188} bgColor="transparent" fgColor="#f4f2ec" level="M" />
        </div>

        <button className="receive-modal__address mono" onClick={copy}>
          {user?.payAddress || "no pay address set"}
          <Copy size={13} />
        </button>
        {copied ? <span className="receive-modal__copied">Copied</span> : null}
      </motion.div>
    </div>
  );
}
