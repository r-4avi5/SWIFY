import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Eye, EyeOff } from "lucide-react";
import { initials } from "../../lib/format";
import "./WalletCard.css";

// The signature element of the app: a physical-feeling debit card rendered
// in CSS. It tilts toward the pointer like a foil card catching light, and
// its balance runs through a mono slot-counter whenever the amount changes.
export default function WalletCard({ user, wallet, hideBalance, onToggleHidden }) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);
  const digitsRef = useRef(null);
  const prevBalance = useRef(0);

  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(card, {
        rotateY: x * 10,
        rotateX: y * -10,
        transformPerspective: 900,
        duration: 0.5,
        ease: "power3.out",
      });
      gsap.to(glowRef.current, {
        x: x * 140,
        y: y * 140,
        opacity: 0.9,
        duration: 0.5,
        ease: "power3.out",
      });
    };

    const handleLeave = () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: "elastic.out(1, 0.6)" });
      gsap.to(glowRef.current, { opacity: 0, duration: 0.4 });
    };

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", handleLeave);
    gsap.from(card, { y: 24, opacity: 0, duration: 0.7, ease: "power3.out" });

    return () => {
      card.removeEventListener("mousemove", handleMove);
      card.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  useGSAP(
    () => {
      const target = Number(wallet?.balance ?? 0);
      const counter = { value: prevBalance.current };
      gsap.to(counter, {
        value: target,
        duration: 0.9,
        ease: "power2.out",
        onUpdate: () => {
          if (digitsRef.current) {
            digitsRef.current.textContent = counter.value.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }
        },
        onComplete: () => {
          prevBalance.current = target;
        },
      });
    },
    { dependencies: [wallet?.balance] }
  );

  const [flipped] = useState(false);

  return (
    <div className="wallet-card__stage">
      <div className={`wallet-card ${flipped ? "is-flipped" : ""}`} ref={cardRef}>
        <div className="wallet-card__glow" ref={glowRef} />
        <div className="wallet-card__foil" />

        <div className="wallet-card__top">
          <span className="wallet-card__brand">Swify</span>
          <span className="wallet-card__chip" aria-hidden="true" />
        </div>

        <div className="wallet-card__balance-row">
          <span className="wallet-card__balance-label">Available balance</span>
          <button type="button" className="wallet-card__eye" onClick={onToggleHidden} aria-label="Toggle balance visibility">
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="wallet-card__balance mono">
          {hideBalance ? (
            <span>•••••••</span>
          ) : (
            <>
              <span className="wallet-card__currency">₹</span>
              <span ref={digitsRef}>0.00</span>
            </>
          )}
        </div>

        <div className="wallet-card__bottom">
          <div>
            <span className="wallet-card__meta-label">Pay address</span>
            <span className="wallet-card__meta-value mono">{user?.payAddress || "not set yet"}</span>
          </div>
          <div className="wallet-card__holder">
            <span className="wallet-card__avatar">{initials(user?.fullName || user?.displayName)}</span>
            <span className="wallet-card__meta-value">{user?.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
