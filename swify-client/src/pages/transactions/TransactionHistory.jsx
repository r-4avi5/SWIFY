import { useEffect, useState } from "react";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import TransactionRow from "../../components/transactions/TransactionRow";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { getTransactionHistory } from "../../api/transaction.api";
import "./TransactionHistory.css";

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

      <div className="tx-history">
        <div className="tx-history__panel">
          {loading ? (
            <Loader label="Loading activity" />
          ) : error ? (
            <EmptyState icon={Receipt} title="Couldn't load activity" description={error} />
          ) : transactions.length === 0 ? (
            <EmptyState icon={Receipt} title="No transactions yet" description="Your ledger is empty for now." />
          ) : (
            <>
              <div className="tx-history__head">
                <span>Recipient</span>
                <span>Note</span>
                <span>Date</span>
                <span>Status</span>
                <span className="tx-history__head-amount">Amount</span>
              </div>
              {transactions.map((tx) => (
                <TransactionRow key={tx.reference} tx={tx} />
              ))}
            </>
          )}
        </div>

        {totalPages > 1 ? (
          <div className="tx-history__pager">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}
