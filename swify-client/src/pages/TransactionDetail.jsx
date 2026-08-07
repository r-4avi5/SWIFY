import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Copy, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Topbar from "../components/Topbar";
import StatusBadge from "../components/StatusBadge";
import Loader from "../components/Loader";
import EmptyState from "../components/EmptyState";
import { getTransactionByReference } from "../api/transaction.api";
import { formatCurrency, formatDateTime } from "../utils/format";

const STATUS_TONE = { success: "success", pending: "warning", failed: "danger" };

export default function TransactionDetail() {
  const { reference } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let mounted = true;
    getTransactionByReference(reference)
      .then((res) => mounted && setTx(res.data.data))
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [reference]);

  const copyRef = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const isCredit = tx?.type === "Credit";

  return (
    <>
      <Topbar title="Receipt" />
      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[480px]">
        <Link to="/transactions" className="inline-flex items-center gap-1.5 text-slate text-[0.85rem] font-semibold mb-5 hover:text-ivory">
          <ArrowLeft size={15} /> Back to activity
        </Link>

        {loading ? (
          <Loader label="Loading receipt" />
        ) : error || !tx ? (
          <EmptyState title="Receipt not found" description={error || "This transaction reference doesn't exist."} />
        ) : (
          <div className="bg-panel border border-hairline rounded-3xl p-[34px_30px] text-center flex flex-col items-center shadow-lg">
            <span
              className={`w-[52px] h-[52px] rounded-full grid place-items-center mb-3.5 ${
                isCredit ? "bg-signal-soft text-signal" : "bg-coral-soft text-coral"
              }`}
            >
              {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
            </span>

            <p className="text-[2rem] font-bold m-0 mb-1 font-mono">
              {isCredit ? "+" : "−"} {formatCurrency(tx.amount)}
            </p>
            <p className="m-0 mb-3.5 text-slate text-[0.88rem]">{isCredit ? "Money received" : "Money sent"}</p>

            <StatusBadge tone={STATUS_TONE[tx.status] || "neutral"}>{tx.status}</StatusBadge>

            <div className="w-full border-t border-dashed border-hairline my-[22px]" />

            <dl className="w-full m-0 flex flex-col gap-3">
              <div className="flex justify-between gap-3">
                <dt className="text-slate text-[0.82rem]">{isCredit ? "From" : "To"}</dt>
                <dd className="m-0 text-[0.86rem] font-semibold text-right max-w-[60%]">
                  {tx.person?.fullName || tx.person?.fullname || "Swify user"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate text-[0.82rem]">Pay address</dt>
                <dd className="m-0 text-[0.86rem] font-semibold text-right max-w-[60%] font-mono">
                  {tx.person?.payAddress || "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate text-[0.82rem]">Note</dt>
                <dd className="m-0 text-[0.86rem] font-semibold text-right max-w-[60%]">{tx.note || "No note added"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate text-[0.82rem]">Payment method</dt>
                <dd className="m-0 text-[0.86rem] font-semibold text-right max-w-[60%]">{tx.paymentMethod}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate text-[0.82rem]">Date</dt>
                <dd className="m-0 text-[0.86rem] font-semibold text-right max-w-[60%]">{formatDateTime(tx.createdAt)}</dd>
              </div>
            </dl>

            <div className="w-full border-t border-dashed border-hairline my-[22px]" />

            <button
              type="button"
              onClick={copyRef}
              className="inline-flex items-center gap-2 bg-panel-2 border border-hairline rounded-full px-4 py-2 text-[0.82rem] text-ivory cursor-pointer hover:border-brass"
            >
              <span className="font-mono">{tx.reference}</span>
              <Copy size={13} />
            </button>
            {copied ? <span className="block mt-2 text-[0.76rem] text-signal font-bold">Copied</span> : null}
          </div>
        )}
      </div>
    </>
  );
}
