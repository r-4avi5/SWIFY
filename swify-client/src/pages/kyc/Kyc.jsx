import { useState } from "react";
import { UploadCloud, Check, ShieldCheck } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import StatusBadge from "../../components/common/StatusBadge";
import { submitKYC } from "../../api/kyc.api";
import "./Kyc.css";

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
        <div className="kyc">
          <div className="kyc__submitted">
            <span className="kyc__submitted-icon">
              <Check size={22} />
            </span>
            <h2>KYC submitted</h2>
            <p>Your documents are queued for review.</p>
            <StatusBadge tone={STATUS_TONE[result.status] || "neutral"}>
              {result.status?.replace("_", " ")}
            </StatusBadge>
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

      <div className="kyc">
        <form className="kyc__form" onSubmit={onSubmit}>
          <div className="kyc__grid">
            <Field label="Aadhaar number">
              <input
                className="input mono"
                inputMode="numeric"
                maxLength={12}
                placeholder="123412341234"
                value={form.aadharNumber}
                onChange={(e) => setForm((f) => ({ ...f, aadharNumber: e.target.value.replace(/\D/g, "") }))}
              />
            </Field>
            <Field label="PAN number">
              <input
                className="input mono"
                maxLength={10}
                placeholder="ABCDE1234F"
                value={form.panNumber}
                onChange={(e) => setForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))}
              />
            </Field>
          </div>

          <div className="kyc__docs">
            {DOC_FIELDS.map(({ key, label }) => (
              <label key={key} className={`kyc__dropzone ${docs[key] ? "is-filled" : ""}`}>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => onFile(key, e.target.files?.[0])}
                />
                {docs[key] ? <Check size={18} /> : <UploadCloud size={18} />}
                <span>{docs[`${key}Name`] || label}</span>
              </label>
            ))}
          </div>

          {error ? <p className="kyc__error">{error}</p> : null}

          <Button type="submit" size="lg" loading={loading}>
            <ShieldCheck size={17} /> Submit for review
          </Button>
        </form>
      </div>
    </>
  );
}
