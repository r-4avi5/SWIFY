import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "../../lib/format";
import StatusBadge from "../common/StatusBadge";
import "./TransactionRow.css";

const STATUS_TONE = { success: "success", pending: "warning", failed: "danger" };

export default function TransactionRow({ tx }) {
  const isCredit = tx.type === "Credit" || tx.type === "credit";
  const person = tx.person || {};

  return (
    <Link to={`/transactions/${tx.reference}`} className="tx-row">
      <span className={`tx-row__icon ${isCredit ? "is-credit" : "is-debit"}`}>
        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </span>

      <span className="tx-row__main">
        <span className="tx-row__name">{person.fullName || person.fullname || "Swify user"}</span>
        <span className="tx-row__meta mono">{tx.reference}</span>
      </span>

      <span className="tx-row__note">{tx.note || "No note added"}</span>

      <span className="tx-row__time">{formatDateTime(tx.createdAt)}</span>

      <StatusBadge tone={STATUS_TONE[tx.status] || "neutral"}>{tx.status}</StatusBadge>

      <span className={`tx-row__amount mono ${isCredit ? "is-credit" : "is-debit"}`}>
        {isCredit ? "+" : "−"} {formatCurrency(tx.amount)}
      </span>
    </Link>
  );
}
