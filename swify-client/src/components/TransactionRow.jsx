import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency, formatDateTime } from "../utils/format";
import StatusBadge from "./StatusBadge";

const STATUS_TONE = { success: "success", pending: "warning", failed: "danger" };

export default function TransactionRow({ tx }) {
  const isCredit = tx.type === "Credit" || tx.type === "credit";
  const person = tx.person || {};

  return (
    <Link
      to={`/transactions/${tx.reference}`}
      className="grid grid-cols-[36px_1.4fr_1fr_130px_100px_130px] max-md:grid-cols-[32px_1fr_auto] items-center gap-3.5 px-[18px] py-3.5 border-b border-dashed border-hairline last:border-none text-ivory hover:bg-panel-2 transition-colors"
    >
      <span
        className={`w-8 h-8 rounded-full grid place-items-center shrink-0 ${
          isCredit ? "bg-signal-soft text-signal" : "bg-coral-soft text-coral"
        }`}
      >
        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
      </span>

      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="font-bold text-[0.92rem] whitespace-nowrap overflow-hidden text-ellipsis">
          {person.fullName || person.fullname || "Swify user"}
        </span>
        <span className="text-[0.72rem] text-slate-dim font-mono">{tx.reference}</span>
      </span>

      <span className="max-md:hidden text-[0.85rem] text-slate whitespace-nowrap overflow-hidden text-ellipsis">
        {tx.note || "No note added"}
      </span>

      <span className="max-md:hidden text-[0.78rem] text-slate">{formatDateTime(tx.createdAt)}</span>

      <span className="max-md:hidden">
        <StatusBadge tone={STATUS_TONE[tx.status] || "neutral"}>{tx.status}</StatusBadge>
      </span>

      <span className={`text-right font-bold text-[0.92rem] font-mono ${isCredit ? "text-signal" : "text-ivory"}`}>
        {isCredit ? "+" : "−"} {formatCurrency(tx.amount)}
      </span>
    </Link>
  );
}
