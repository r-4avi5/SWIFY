import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Copy, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import StatusBadge from "../../components/common/StatusBadge";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import { getTransactionByReference } from "../../api/transaction.api";
import { formatCurrency, formatDateTime } from "../../lib/format";
import "./TransactionDetail.css";

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
      <div className="tx-detail">
        <Link to="/transactions" className="tx-detail__back">
          <ArrowLeft size={15} /> Back to activity
        </Link>

        {loading ? (
          <Loader label="Loading receipt" />
        ) : error || !tx ? (
          <EmptyState title="Receipt not found" description={error || "This transaction reference doesn't exist."} />
        ) : (
          <div className="receipt">
            <div className="receipt__perforation" />
            <div className="receipt__body">
              <span className={`receipt__icon ${isCredit ? "is-credit" : "is-debit"}`}>
                {isCredit ? <ArrowDownLeft size={22} /> : <ArrowUpRight size={22} />}
              </span>

              <p className="receipt__amount mono">
                {isCredit ? "+" : "−"} {formatCurrency(tx.amount)}
              </p>
              <p className="receipt__type">{isCredit ? "Money received" : "Money sent"}</p>

              <StatusBadge tone={STATUS_TONE[tx.status] || "neutral"}>{tx.status}</StatusBadge>

              <div className="receipt__divider" />

              <dl className="receipt__list">
                <div>
                  <dt>{isCredit ? "From" : "To"}</dt>
                  <dd>{tx.person?.fullName || tx.person?.fullname || "Swify user"}</dd>
                </div>
                <div>
                  <dt>Pay address</dt>
                  <dd className="mono">{tx.person?.payAddress || "—"}</dd>
                </div>
                <div>
                  <dt>Note</dt>
                  <dd>{tx.note || "No note added"}</dd>
                </div>
                <div>
                  <dt>Payment method</dt>
                  <dd>{tx.paymentMethod}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{formatDateTime(tx.createdAt)}</dd>
                </div>
              </dl>

              <div className="receipt__divider" />

              <button type="button" className="receipt__ref" onClick={copyRef}>
                <span className="mono">{tx.reference}</span>
                <Copy size={13} />
              </button>
              {copied ? <span className="receipt__copied">Copied</span> : null}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
