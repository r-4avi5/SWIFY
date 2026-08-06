import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Send, QrCode, ArrowDownToLine, ShieldAlert, Receipt } from "lucide-react";
import Topbar from "../../components/layout/Topbar";
import WalletCard from "../../components/wallet/WalletCard";
import ReceiveModal from "../../components/wallet/ReceiveModal";
import TransactionRow from "../../components/transactions/TransactionRow";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../context/AuthContext";
import { getWallet } from "../../api/wallet.api";
import { getTransactionHistory } from "../../api/transaction.api";
import { formatCurrency } from "../../lib/format";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [showReceive, setShowReceive] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          getWallet(),
          getTransactionHistory(1, 5),
        ]);
        if (!mounted) return;
        setWallet(walletRes.data.data);
        setTransactions(txRes.data.transactions || []);
      } catch {
        /* surfaced via empty states below */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const isKycVerified = false; // resolved server-side; refined on the KYC page

  return (
    <>
      <Topbar title={`Hi ${user?.displayName || ""}`} subtitle="Here's what's happening with your wallet today." />

      <div className="dashboard">
        <section className="dashboard__hero">
          <WalletCard
            user={user}
            wallet={wallet || { balance: 0 }}
            hideBalance={hideBalance}
            onToggleHidden={() => setHideBalance((v) => !v)}
          />

          <div className="dashboard__quick-actions">
            <Link to="/transfer" className="quick-action">
              <span className="quick-action__icon"><Send size={18} /></span>
              <span>Send money</span>
            </Link>
            <button type="button" className="quick-action" onClick={() => setShowReceive(true)}>
              <span className="quick-action__icon"><ArrowDownToLine size={18} /></span>
              <span>Receive</span>
            </button>
            <Link to="/transfer?mode=scan" className="quick-action">
              <span className="quick-action__icon"><QrCode size={18} /></span>
              <span>Scan &amp; pay</span>
            </Link>
            <Link to="/transactions" className="quick-action">
              <span className="quick-action__icon"><Receipt size={18} /></span>
              <span>Activity</span>
            </Link>
          </div>

          {wallet ? (
            <div className="dashboard__limits">
              <div>
                <span className="dashboard__limits-label">Daily limit used</span>
                <span className="mono">
                  {formatCurrency(wallet.dailyTransferredAmount || 0)} / {formatCurrency(wallet.dailyTransactionLimit)}
                </span>
              </div>
              <div className="dashboard__limits-bar">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      ((wallet.dailyTransferredAmount || 0) / (wallet.dailyTransactionLimit || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ) : null}
        </section>

        <section className="dashboard__panel">
          <div className="dashboard__panel-head">
            <h2>Recent activity</h2>
            <Link to="/transactions" className="dashboard__panel-link">
              View all
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading transactions" />
          ) : transactions.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions yet"
              description="Send your first payment and it'll show up here, receipt-style."
              action={
                <Link to="/transfer" className="btn btn--primary btn--sm" style={{ marginTop: 8 }}>
                  Send money
                </Link>
              }
            />
          ) : (
            <div className="dashboard__ledger">
              {transactions.map((tx) => (
                <TransactionRow key={tx.reference} tx={tx} />
              ))}
            </div>
          )}
        </section>

        {!isKycVerified && (
          <Link to="/kyc" className="dashboard__kyc-banner">
            <ShieldAlert size={18} />
            <span>Verify your identity to unlock higher transfer limits.</span>
            <span className="dashboard__kyc-banner-cta">Start KYC →</span>
          </Link>
        )}
      </div>

      <AnimatePresence>
        {showReceive ? <ReceiveModal user={user} onClose={() => setShowReceive(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
