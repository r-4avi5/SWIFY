import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Send, QrCode, ScanLine } from "lucide-react";
import Topbar from "../components/Topbar";
import Field, { inputClass, textareaClass } from "../components/Field";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import MpinModal from "../components/MpinModal";
import { resolvePaymentUser } from "../api/paymentIdentity.api";
import { scanQR, transferMoney, transferByQR } from "../api/transfer.api";
import { formatCurrency, initials } from "../utils/format";

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

      <div className="px-10 pt-2 pb-10 max-md:px-5 flex">
        <AnimatePresence mode="wait">
          {step === STEP.RECIPIENT && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.22 }}
              className="w-full max-w-[460px] bg-panel border border-hairline rounded-3xl p-7"
            >
              <div className="flex gap-1.5 p-1 bg-panel-2 rounded-full mb-[22px]">
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-[0.85rem] ${
                    mode === "id" ? "bg-panel-3 text-brass-soft" : "text-slate"
                  }`}
                  onClick={() => setMode("id")}
                >
                  <Send size={15} /> Pay ID
                </button>
                <button
                  type="button"
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full font-bold text-[0.85rem] ${
                    mode === "scan" ? "bg-panel-3 text-brass-soft" : "text-slate"
                  }`}
                  onClick={() => setMode("scan")}
                >
                  <QrCode size={15} /> Scan &amp; pay
                </button>
              </div>

              {mode === "id" ? (
                <form onSubmit={resolveById} className="flex flex-col gap-[18px]">
                  <Field label="swifyId or pay address">
                    <input
                      className={`${inputClass} font-mono`}
                      required
                      placeholder="rhea.k or pay@rhea.swify"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoFocus
                    />
                  </Field>
                  {error ? (
                    <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
                  ) : null}
                  <Button type="submit" size="lg" loading={resolving}>
                    Continue
                  </Button>
                </form>
              ) : (
                <form onSubmit={resolveByQr} className="flex flex-col gap-[18px]">
                  <Field label="QR payload" hint="Paste the code data from the recipient's Receive screen">
                    <textarea
                      className={`${textareaClass} font-mono`}
                      required
                      placeholder='{"payAddress":"pay@rhea.swify"}'
                      value={qrText}
                      onChange={(e) => setQrText(e.target.value)}
                    />
                  </Field>
                  {error ? (
                    <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
                  ) : null}
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
              className="w-full max-w-[460px] bg-panel border border-hairline rounded-3xl p-7"
            >
              <button
                type="button"
                className="flex items-center gap-1.5 bg-none border-none text-slate text-[0.82rem] font-semibold cursor-pointer mb-[18px] p-0 hover:text-ivory"
                onClick={() => setStep(STEP.RECIPIENT)}
              >
                <ArrowLeft size={15} /> Change recipient
              </button>

              <div className="flex items-center gap-3 p-[14px_16px] rounded-2xl bg-panel-2 mb-[22px]">
                <span className="w-10 h-10 rounded-full bg-panel-3 grid place-items-center font-extrabold text-[0.82rem] text-brass-soft shrink-0">
                  {initials(receiver?.fullName || receiver?.displayName || "")}
                </span>
                <div>
                  <p className="m-0 font-bold text-[0.92rem]">{receiver?.fullName || receiver?.displayName}</p>
                  <p className="m-[2px_0_0] text-[0.76rem] text-slate font-mono">{receiver?.payAddress}</p>
                </div>
                {receiver?.kycStatus ? (
                  <StatusBadge tone={receiver.kycStatus === "VERIFIED" ? "success" : "neutral"}>
                    {receiver.kycStatus.replace("_", " ")}
                  </StatusBadge>
                ) : null}
              </div>

              <form onSubmit={goToConfirm} className="flex flex-col gap-[18px]">
                <Field label="Amount (INR)">
                  <input
                    className={`${inputClass} font-mono`}
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
                    className={inputClass}
                    maxLength={100}
                    placeholder="For dinner last night"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </Field>
                {error ? (
                  <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
                ) : null}
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
              className="w-full max-w-[460px] bg-panel border border-hairline rounded-3xl p-[40px_28px] text-center"
            >
              <span className="w-[52px] h-[52px] rounded-full bg-signal-soft text-signal grid place-items-center mx-auto mb-4">
                <Check size={22} />
              </span>
              <h2 className="m-0 mb-2 text-[1.3rem] font-extrabold">Payment sent</h2>
              <p className="text-[2rem] font-bold m-0 mb-1.5 font-mono">{formatCurrency(result?.amount || amount)}</p>
              <p className="text-slate text-[0.85rem] m-0 mb-[26px]">
                to {result?.receiver?.fullName || receiver?.fullName} · <span className="font-mono">{result?.reference}</span>
              </p>
              <div className="flex justify-center gap-3">
                <Button variant="ghost" onClick={reset}>
                  Send another
                </Button>
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
