import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function AuthLayout({ eyebrow, title, tagline, children }) {
  const artRef = useRef(null);

  useGSAP(() => {
    gsap.fromTo(
      artRef.current,
      { rotateY: -8, rotateX: 6, y: 30, opacity: 0 },
      { rotateY: -8, rotateX: 6, y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
    );
  }, []);

  return (
    <div className="min-h-screen grid grid-cols-[1.1fr_1fr] max-[980px]:grid-cols-1">
      <div className="p-12 flex flex-col justify-between border-r border-hairline bg-[radial-gradient(900px_500px_at_100%_0%,rgba(203,163,92,0.09),transparent_60%),linear-gradient(180deg,var(--color-ink-2),var(--color-ink))] max-[980px]:hidden">
        <div className="flex items-center gap-2.5 font-extrabold text-[1.1rem]">
          <span className="w-8 h-8 rounded-[9px] grid place-items-center bg-gradient-to-br from-brass-soft to-brass text-[#241a08]">
            S
          </span>
          <span>Swify</span>
        </div>

        <div className="max-w-[460px] my-10">
          <p className="text-brass-soft uppercase tracking-widest text-[0.74rem] font-bold mb-3.5">
            Pay anyone, instantly
          </p>
          <h1 className="text-[2.5rem] leading-[1.12] font-extrabold tracking-tight mb-[18px]">
            Money moves at the
            <br />
            speed of a swifyId.
          </h1>
          <p className="text-slate text-base leading-relaxed m-0">
            Send to a pay address, scan a code, or split a bill — every
            transfer is locked behind your MPIN, down to the rupee.
          </p>
        </div>

        <div
          ref={artRef}
          className="[perspective:1000px] w-full max-w-[380px] rounded-[20px] p-[22px_24px] bg-gradient-to-br from-[#16204a] to-[#0d1430] border border-brass/25 shadow-2xl"
        >
          <div className="flex items-center justify-between text-[0.78rem] text-slate tracking-wider">
            <span>SWIFY WALLET</span>
            <span className="w-[26px] h-[18px] rounded [background:linear-gradient(140deg,var(--color-brass-soft),var(--color-brass-dim))]" />
          </div>
          <div className="text-[1.9rem] font-bold my-5 text-ivory font-mono">₹ 24,180.50</div>
          <div className="flex items-center justify-between text-ivory text-[0.82rem]">
            <span className="font-mono">pay@rhea.swify</span>
            <span>Rhea Kapoor</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-12 max-[980px]:p-8">
        <div className="w-full max-w-[380px]">
          <p className="text-brass-soft uppercase tracking-widest text-[0.72rem] font-bold mb-2">{eyebrow}</p>
          <h2 className="text-[1.7rem] font-extrabold mb-2">{title}</h2>
          {tagline ? <p className="text-slate text-[0.92rem] mb-7">{tagline}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
