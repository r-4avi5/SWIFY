import { QRCodeSVG } from "qrcode.react";
import { X, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ReceiveModal({ user, onClose }) {
  const [copied, setCopied] = useState(false);
  const payload = JSON.stringify({ payAddress: user?.payAddress });

  const copy = () => {
    navigator.clipboard.writeText(user?.payAddress || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-[100] p-5" onClick={onClose}>
      <motion.div
        className="relative w-full max-w-[340px] bg-panel border border-hairline rounded-3xl p-[32px_28px_28px] text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button
          className="absolute top-4 right-4 w-[30px] h-[30px] rounded-full border-none bg-panel-2 text-slate grid place-items-center cursor-pointer"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <p className="m-0 mb-1.5 text-[0.72rem] uppercase tracking-widest text-brass-soft font-bold">Receive money</p>
        <h3 className="m-0 mb-[22px] text-[1.1rem] font-extrabold">Scan to pay {user?.displayName}</h3>

        <div className="bg-ink-2 border border-hairline rounded-2xl p-5 inline-flex mb-5">
          <QRCodeSVG value={payload} size={188} bgColor="transparent" fgColor="#f4f2ec" level="M" />
        </div>

        <button
          className="inline-flex items-center gap-2 bg-panel-2 border border-hairline rounded-full px-4 py-2 text-sm text-ivory font-mono cursor-pointer hover:border-brass"
          onClick={copy}
        >
          {user?.payAddress || "no pay address set"}
          <Copy size={13} />
        </button>
        {copied ? <span className="block mt-2 text-[0.76rem] text-signal font-bold">Copied</span> : null}
      </motion.div>
    </div>
  );
}
