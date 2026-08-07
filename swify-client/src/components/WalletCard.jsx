import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Eye, EyeOff } from "lucide-react";
import { initials } from "../utils/format";

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

  return (
    <div className="[perspective:1200px] w-full max-w-[420px]">
      <div
        ref={cardRef}
        className="relative rounded-[22px] p-[26px_28px_24px] min-h-[220px] border border-brass/25 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.65)] [transform-style:preserve-3d] overflow-hidden will-change-transform bg-[radial-gradient(120%_140%_at_100%_0%,rgba(232,207,149,0.14),transparent_55%),linear-gradient(155deg,#16204a_0%,#101832_55%,#0b1128_100%)]"
      >
        <div
          ref={glowRef}
          className="absolute top-1/2 left-1/2 w-[260px] h-[260px] -mt-[130px] -ml-[130px] opacity-0 pointer-events-none blur-sm bg-[radial-gradient(circle,rgba(232,207,149,0.35),transparent_70%)]"
        />
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(120deg,rgba(255,255,255,0.025)_0px,rgba(255,255,255,0.025)_1px,transparent_1px,transparent_6px)]" />

        <div className="relative z-[2] flex items-center justify-between">
          <span className="font-extrabold text-[1.05rem] tracking-tight text-brass-soft">Swify</span>
          <span
            aria-hidden="true"
            className="w-[34px] h-6 rounded-[5px] relative bg-gradient-to-br from-brass-soft to-brass-dim after:content-[''] after:absolute after:inset-1 after:border after:border-black/25 after:rounded-[3px]"
          />
        </div>

        <div className="relative z-[2] flex items-center justify-between mt-[26px]">
          <span className="text-[0.74rem] uppercase tracking-widest text-slate">Available balance</span>
          <button
            type="button"
            onClick={onToggleHidden}
            aria-label="Toggle balance visibility"
            className="bg-none border-none text-slate cursor-pointer p-1 hover:text-brass-soft"
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="relative z-[2] mt-1.5 flex items-baseline gap-1 text-[2.2rem] font-bold text-ivory font-mono tabular-nums">
          {hideBalance ? (
            <span>•••••••</span>
          ) : (
            <>
              <span className="text-[1.2rem] text-brass-soft">₹</span>
              <span ref={digitsRef}>0.00</span>
            </>
          )}
        </div>

        <div className="relative z-[2] mt-7 flex items-end justify-between gap-3">
          <div>
            <span className="block text-[0.66rem] uppercase tracking-widest text-slate-dim mb-1">Pay address</span>
            <span className="text-[0.86rem] font-semibold text-ivory font-mono">{user?.payAddress || "not set yet"}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-[26px] h-[26px] rounded-full bg-panel-3 grid place-items-center text-[0.66rem] font-extrabold text-brass-soft shrink-0">
              {initials(user?.fullName || user?.displayName)}
            </span>
            <span className="text-[0.86rem] font-semibold text-ivory">{user?.displayName}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
