import { useEffect, useState } from "react";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import Topbar from "../components/Topbar";
import TransactionRow from "../components/TransactionRow";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { getTransactionHistory } from "../api/transaction.api";

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getTransactionHistory(page, 20)
      .then((res) => {
        if (!mounted) return;
        setTransactions(res.data.transactions || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [page]);

  return (
    <>
      <Topbar title="Activity" subtitle="Every transfer, receipt-style — click a row for the full detail." />

      <div className="px-10 pt-2 pb-10 max-md:px-5 max-w-[1080px] flex flex-col gap-4">
        <div className="border border-hairline rounded-3xl bg-panel overflow-hidden">
          {loading ? (
            <Loader label="Loading activity" />
          ) : error ? (
            <EmptyState icon={Receipt} title="Couldn't load activity" description={error} />
          ) : transactions.length === 0 ? (
            <EmptyState icon={Receipt} title="No transactions yet" description="Your ledger is empty for now." />
          ) : (
            <>
              <div className="hidden md:grid grid-cols-[36px_1.4fr_1fr_130px_100px_130px] gap-3.5 px-[18px] py-3 text-[0.7rem] uppercase tracking-wider text-slate-dim border-b border-hairline [&>span:first-child]:col-start-2">
                <span>Recipient</span>
                <span>Note</span>
                <span>Date</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>
              {transactions.map((tx) => (
                <TransactionRow key={tx.reference} tx={tx} />
              ))}
            </>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="flex items-center justify-center gap-4 text-[0.82rem] text-slate">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 rounded-full border border-hairline bg-panel text-ivory grid place-items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 rounded-full border border-hairline bg-panel text-ivory grid place-items-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
