import { useState } from "react";
import { UploadCloud, Check, ShieldCheck } from "lucide-react";
import Topbar from "../components/Topbar";
import Field, { inputClass } from "../components/Field";
import Button from "../components/Button";
import StatusBadge from "../components/StatusBadge";
import { submitKYC } from "../api/kyc.api";

const DOC_FIELDS = [
  { key: "aadharFront", label: "Aadhaar — front" },
  { key: "aadharBack", label: "Aadhaar — back" },
  { key: "panCard", label: "PAN card" },
  { key: "selfie", label: "Selfie" },
];

const STATUS_TONE = { VERIFIED: "success", UNDER_REVIEW: "warning", REJECTED: "danger", PENDING: "neutral" };

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function Kyc() {
  const [form, setForm] = useState({ aadharNumber: "", panNumber: "" });
  const [docs, setDocs] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onFile = async (key, file) => {
    if (!file) return;
    const dataUrl = await readAsDataUrl(file);
    setDocs((d) => ({ ...d, [key]: dataUrl, [`${key}Name`]: file.name }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!/^\d{12}$/.test(form.aadharNumber)) {
      setError("Aadhaar number must be exactly 12 digits.");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber.toUpperCase())) {
      setError("Enter a valid PAN (e.g. ABCDE1234F).");
      return;
    }
    if (DOC_FIELDS.some(({ key }) => !docs[key])) {
      setError("Upload all four documents to continue.");
      return;
    }

    setLoading(true);
    try {
      const res = await submitKYC({
        aadharNumber: form.aadharNumber,
        panNumber: form.panNumber.toUpperCase(),
        aadharFront: docs.aadharFront,
        aadharBack: docs.aadharBack,
        panCard: docs.panCard,
        selfie: docs.selfie,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <>
        <Topbar title="Identity verification" />
        <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[560px]">
          <div className="bg-panel border border-hairline rounded-3xl p-11 px-7 text-center">
            <span className="w-[52px] h-[52px] rounded-full bg-signal-soft text-signal grid place-items-center mx-auto mb-4">
              <Check size={22} />
            </span>
            <h2 className="m-0 mb-1.5 text-xl font-extrabold">KYC submitted</h2>
            <p className="m-0 mb-4 text-slate text-[0.88rem]">Your documents are queued for review.</p>
            <StatusBadge tone={STATUS_TONE[result.status] || "neutral"}>{result.status?.replace("_", " ")}</StatusBadge>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Identity verification"
        subtitle="Verify your Aadhaar and PAN once to unlock higher transfer limits."
      />

      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[560px]">
        <form className="bg-panel border border-hairline rounded-3xl p-7 flex flex-col gap-[22px]" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-[18px]">
            <Field label="Aadhaar number">
              <input
                className={`${inputClass} font-mono`}
                inputMode="numeric"
                maxLength={12}
                placeholder="123412341234"
                value={form.aadharNumber}
                onChange={(e) => setForm((f) => ({ ...f, aadharNumber: e.target.value.replace(/\D/g, "") }))}
              />
            </Field>
            <Field label="PAN number">
              <input
                className={`${inputClass} font-mono`}
                maxLength={10}
                placeholder="ABCDE1234F"
                value={form.panNumber}
                onChange={(e) => setForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 max-[640px]:grid-cols-1 gap-3">
            {DOC_FIELDS.map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-2.5 py-3.5 px-4 rounded-2xl border-[1.5px] border-dashed cursor-pointer text-[0.82rem] font-semibold overflow-hidden transition-colors ${
                  docs[key]
                    ? "border-solid border-signal text-signal bg-signal-soft"
                    : "border-hairline-strong text-slate hover:border-brass hover:text-ivory"
                }`}
              >
                <input type="file" accept="image/*" hidden onChange={(e) => onFile(key, e.target.files?.[0])} />
                {docs[key] ? <Check size={18} /> : <UploadCloud size={18} />}
                <span className="whitespace-nowrap overflow-hidden text-ellipsis">{docs[`${key}Name`] || label}</span>
              </label>
            ))}
          </div>

          {error ? (
            <p className="m-0 px-3.5 py-2.5 rounded-[10px] bg-coral-soft text-coral text-sm font-semibold">{error}</p>
          ) : null}

          <Button type="submit" size="lg" loading={loading}>
            <ShieldCheck size={17} /> Submit for review
          </Button>
        </form>
      </div>
    </>
  );
}
