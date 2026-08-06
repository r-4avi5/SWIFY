import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Send, QrCode, ScanLine } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import MpinModal from "../../components/mpin/MpinModal";
import { resolvePaymentUser } from "../../api/paymentIdentity.api";
import { scanQR, transferMoney, transferByQR } from "../../api/transfer.api";
import { formatCurrency } from "../../lib/format";
import { initials } from "../../lib/format";
import "./Transfer.css";

const STEP = { RECIPIENT: 0, AMOUNT: 1, DONE: 2 };

export default function Transfer() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("mode") === "scan" ? "scan" : "id");

  const [step, setStep] = useState(STEP.RECIPIENT);
  const [identifier, setIdentifier] = useState("");
  const [qrText, setQrText] = useState("");
  const [receiver, setReceiver] = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [resolving, setResolving] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [paying, setPaying] = useState(false);
  const [result, setResult] = useState(null);

  const resolveById = async (e) => {
    e.preventDefault();
    setError("");
    setResolving(true);
    try {
      const res = await resolvePaymentUser(identifier);
      setReceiver({ ...res.data.data, identifier });
      setStep(STEP.AMOUNT);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  };

  const resolveByQr = async (e) => {
    e.preventDefault();
    setError("");
    setResolving(true);
    try {
      const res = await scanQR(qrText);
      setReceiver({ ...res.data.data, qrData: qrText });
      setStep(STEP.AMOUNT);
    } catch (err) {
      setError(err.message);
    } finally {
      setResolving(false);
    }
  };

  const goToConfirm = (e) => {
    e.preventDefault();
    setError("");
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setShowMpin(true);
  };

  const onVerified = async (paymentToken) => {
    setPaying(true);
    setError("");
    try {
      let res;
      if (receiver?.qrData) {
        res = await transferByQR({ qrData: receiver.qrData, amount: Number(amount), note, paymentToken });
      } else {
        res = await transferMoney({ receiver: receiver.identifier, amount: Number(amount), note, paymentToken });
      }
      setResult(res.data.data);
      setShowMpin(false);
      setStep(STEP.DONE);
    } catch (err) {
      setError(err.message);
      setShowMpin(false);
    } finally {
      setPaying(false);
    }
  };

  const reset = () => {
    setStep(STEP.RECIPIENT);
    setIdentifier("");
    setQrText("");
    setReceiver(null);
    setAmount("");
    setNote("");
    setResult(null);
    setError("");
  };

  return (
    <>
      <Topbar title="Send money" subtitle="Pay any swifyId or pay address — locked behind your MPIN." />

      <div className="transfer">
        <AnimatePresence mode="wait">
          {step === STEP.RECIPIENT && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="transfer__card"
            >
              <div className="transfer__tabs">
                <button
                  type="button"
                  className={mode === "id" ? "is-active" : ""}
                  onClick={() => setMode("id")}
                >
                  <Send size={15} /> Pay ID
                </button>
                <button
                  type="button"
                  className={mode === "scan" ? "is-active" : ""}
                  onClick={() => setMode("scan")}
                >
                  <QrCode size={15} /> Scan &amp; pay
                </button>
              </div>

              {mode === "id" ? (
                <form onSubmit={resolveById} className="transfer__form">
                  <Field label="swifyId or pay address">
                    <input
                      className="input mono"
                      required
                      placeholder="rhea.k or pay@rhea.swify"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoFocus
                    />
                  </Field>
                  {error ? <p className="transfer__error">{error}</p> : null}
                  <Button type="submit" size="lg" loading={resolving}>
                    Continue
                  </Button>
                </form>
              ) : (
                <form onSubmit={resolveByQr} className="transfer__form">
                  <Field
                    label="QR payload"
                    hint="Paste the code data from the recipient's Receive screen"
                  >
                    <textarea
                      className="textarea mono"
                      required
                      placeholder='{"payAddress":"pay@rhea.swify"}'
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                    />
                  </Field>
                  {error ? <p className="transfer__error">{error}</p> : null}
                  <Button type="submit" size="lg" loading={resolving}>
                    <ScanLine size={17} /> Verify code
                  </Button>
                </form>
              )}
            </motion.div>
          )}

          {step === STEP.AMOUNT && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="transfer__card"
            >
              <button type="button" className="transfer__back" onClick={() => setStep(STEP.RECIPIENT)}>
                <ArrowLeft size={15} /> Change recipient
              </button>

              <div className="transfer__receiver">
                <span className="transfer__receiver-avatar">{initials(receiver?.fullName || receiver?.displayName || "")}</span>
                <div>
                  <p className="transfer__receiver-name">{receiver?.fullName || receiver?.displayName}</p>
                  <p className="transfer__receiver-id mono">{receiver?.payAddress}</p>
                </div>
                {receiver?.kycStatus ? (
                  <StatusBadge tone={receiver.kycStatus === "VERIFIED" ? "success" : "neutral"}>
                    {receiver.kycStatus.replace("_", " ")}
                  </StatusBadge>
                ) : null}
              </div>

              <form onSubmit={goToConfirm} className="transfer__form">
                <Field label="Amount (INR)">
                  <input
                    className="input mono"
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    autoFocus
                  />
                </Field>
                <Field label="Note" hint="Optional, up to 100 characters">
                  <input
                    className="input"
                    maxLength={100}
                    placeholder="For dinner last night"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                {error ? <p className="transfer__error">{error}</p> : null}
                <Button type="submit" size="lg">
                  Review &amp; pay {amount ? formatCurrency(Number(amount) || 0) : ""}
                </Button>
              </form>
            </motion.div>
          )}

          {step === STEP.DONE && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}
              className="transfer__card transfer__success"
            >
              <span className="transfer__success-icon">
                <Check size={22} />
              </span>
              <h2>Payment sent</h2>
              <p className="transfer__success-amount mono">{formatCurrency(result?.amount || amount)}</p>
              <p className="transfer__success-sub">
                to {result?.receiver?.fullName || receiver?.fullName} · <span className="mono">{result?.reference}</span>
              </p>
              <div className="transfer__success-actions">
                <Button variant="ghost" onClick={reset}>Send another</Button>
                <Button onClick={() => navigate(`/transactions/${result?.reference}`)}>View receipt</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showMpin ? (
          <MpinModal
            amount={Number(amount)}
            receiverLabel={receiver?.fullName || receiver?.displayName}
            onClose={() => !paying && setShowMpin(false)}
            onVerified={onVerified}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
