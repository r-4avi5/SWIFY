import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Send, QrCode, ArrowDownToLine, ShieldAlert, Receipt } from "lucide-react";
import Topbar from "../components/Topbar";
import WalletCard from "../components/WalletCard";
import ReceiveModal from "../components/ReceiveModal";
import TransactionRow from "../components/TransactionRow";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";
import { useAuth } from "../context/AuthContext";
import { getWallet } from "../api/wallet.api";
import { getTransactionHistory } from "../api/transaction.api";
import { formatCurrency } from "../utils/format";

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
        const [walletRes, txRes] = await Promise.all([getWallet(), getTransactionHistory(1, 5)]);
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

      <div className="px-10 pt-2 pb-10 max-md:px-5 flex flex-col gap-7 max-w-[1080px]">
        <section className="flex flex-col gap-5">
          <WalletCard
            user={user}
            wallet={wallet || { balance: 0 }}
            hideBalance={hideBalance}
            onToggleHidden={() => setHideBalance((v) => !v)}
          />

          <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-3 max-w-[420px] max-md:max-w-none">
            <Link
              to="/transfer"
              className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-hairline bg-panel text-ivory text-[0.76rem] font-bold cursor-pointer hover:border-brass hover:-translate-y-0.5 transition"
            >
              <span className="w-[38px] h-[38px] rounded-full grid place-items-center bg-panel-2 text-brass-soft">
                <Send size={18} />
              </span>
              <span>Send money</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowReceive(true)}
              className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-hairline bg-panel text-ivory text-[0.76rem] font-bold cursor-pointer hover:border-brass hover:-translate-y-0.5 transition"
            >
              <span className="w-[38px] h-[38px] rounded-full grid place-items-center bg-panel-2 text-brass-soft">
                <ArrowDownToLine size={18} />
              </span>
              <span>Receive</span>
            </button>
            <Link
              to="/transfer?mode=scan"
              className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-hairline bg-panel text-ivory text-[0.76rem] font-bold cursor-pointer hover:border-brass hover:-translate-y-0.5 transition"
            >
              <span className="w-[38px] h-[38px] rounded-full grid place-items-center bg-panel-2 text-brass-soft">
                <QrCode size={18} />
              </span>
              <span>Scan &amp; pay</span>
            </Link>
            <Link
              to="/transactions"
              className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-2xl border border-hairline bg-panel text-ivory text-[0.76rem] font-bold cursor-pointer hover:border-brass hover:-translate-y-0.5 transition"
            >
              <span className="w-[38px] h-[38px] rounded-full grid place-items-center bg-panel-2 text-brass-soft">
                <Receipt size={18} />
              </span>
              <span>Activity</span>
            </Link>
          </div>

          {wallet ? (
            <div className="max-w-[420px] max-md:max-w-none flex flex-col gap-2 p-[14px_16px] rounded-2xl border border-hairline bg-panel">
              <div className="flex justify-between text-[0.78rem] text-slate">
                <span>Daily limit used</span>
                <span className="font-mono">
                  {formatCurrency(wallet.dailyTransferredAmount || 0)} / {formatCurrency(wallet.dailyTransactionLimit)}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-panel-3 overflow-hidden">
                <span
                  className="block h-full bg-gradient-to-r from-brass to-brass-soft"
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

        <section className="border border-hairline rounded-3xl bg-panel overflow-hidden">
          <div className="flex items-center justify-between px-5 py-[18px] border-b border-hairline">
            <h2 className="m-0 text-[1.05rem] font-extrabold">Recent activity</h2>
            <Link to="/transactions" className="text-[0.82rem] font-bold text-brass-soft">
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
                <Link to="/transfer" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brass-soft to-brass text-[#241a08] font-bold text-sm px-4 h-[38px] mt-2">
                  Send money
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col">
              {transactions.map((tx) => (
                <TransactionRow key={tx.reference} tx={tx} />
              ))}
            </div>
          )}
        </section>

        {!isKycVerified && (
          <Link
            to="/kyc"
            className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-brass/10 border border-brass/30 text-brass-soft text-[0.88rem] font-semibold"
          >
            <ShieldAlert size={18} />
            <span>Verify your identity to unlock higher transfer limits.</span>
            <span className="ml-auto font-extrabold">Start KYC →</span>
          </Link>
        )}
      </div>

      <AnimatePresence>
        {showReceive ? <ReceiveModal user={user} onClose={() => setShowReceive(false)} /> : null}
      </AnimatePresence>
    </>
  );
}
