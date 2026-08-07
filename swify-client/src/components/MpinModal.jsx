import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import MpinPad from "./MpinPad";
import { verifyMpin } from "../api/mpin.api";
import { formatCurrency } from "../utils/format";

export default function MpinModal({ amount, receiverLabel, onClose, onVerified }) {
  const [mpin, setMpin] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = async (val) => {
    setMpin(val);
    setError("");
    if (val.length === 6) {
      setSubmitting(true);
      try {
        const res = await verifyMpin(val);
        onVerified(res.data.data?.paymentToken || res.data.paymentToken);
      } catch (err) {
        setError(err.message);
        setMpin("");
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm grid place-items-center z-[100] p-5" onClick={onClose}>
      <motion.div
        className="relative w-full max-w-[360px] bg-panel border border-hairline rounded-3xl p-[32px_28px_30px] text-center shadow-2xl"
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

        <div className="w-11 h-11 rounded-full bg-signal-soft text-signal grid place-items-center mx-auto mb-3.5">
          <ShieldCheck size={20} />
        </div>

        <h3 className="m-0 mb-1.5 text-[1.15rem] font-extrabold">Confirm with your MPIN</h3>
        <p className="m-0 mb-[22px] text-[0.86rem] text-slate">
          Paying {receiverLabel ? <strong className="text-ivory">{receiverLabel}</strong> : "recipient"}{" "}
          {amount ? <span className="font-mono">{formatCurrency(amount)}</span> : null}
        </p>

        <MpinPad value={mpin} onChange={handleChange} error={error} label={submitting ? "Verifying…" : undefined} />
      </motion.div>
    </div>
  );
}
