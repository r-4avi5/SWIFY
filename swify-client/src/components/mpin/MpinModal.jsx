import { useState } from "react";
import { motion } from "framer-motion";
import { X, ShieldCheck } from "lucide-react";
import MpinPad from "./MpinPad";
import { verifyMpin } from "../../api/mpin.api";
import { formatCurrency } from "../../lib/format";
import "./MpinModal.css";

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
    <div className="mpin-modal__backdrop" onClick={onClose}>
      <motion.div
        className="mpin-modal"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <button className="mpin-modal__close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="mpin-modal__icon">
          <ShieldCheck size={20} />
        </div>

        <h3 className="mpin-modal__title">Confirm with your MPIN</h3>
        <p className="mpin-modal__sub">
          Paying {receiverLabel ? <strong>{receiverLabel}</strong> : "recipient"}{" "}
          {amount ? <span className="mono">{formatCurrency(amount)}</span> : null}
        </p>

        <MpinPad value={mpin} onChange={handleChange} error={error} label={submitting ? "Verifying…" : undefined} />
      </motion.div>
    </div>
  );
}
