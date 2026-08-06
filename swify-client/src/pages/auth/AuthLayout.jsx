import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "./AuthLayout.css";

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
    <div className="auth-layout">
      <div className="auth-layout__panel auth-layout__panel--art">
        <div className="auth-layout__brand">
          <span className="auth-layout__mark">S</span>
          <span>Swify</span>
        </div>

        <div className="auth-layout__hero">
          <p className="auth-layout__eyebrow">Pay anyone, instantly</p>
          <h1 className="auth-layout__headline">
            Money moves at the
            <br />
            speed of a swifyId.
          </h1>
          <p className="auth-layout__copy">
            Send to a pay address, scan a code, or split a bill — every
            transfer is locked behind your MPIN, down to the rupee.
          </p>
        </div>

        <div className="auth-layout__art" ref={artRef}>
          <div className="auth-layout__art-row">
            <span>SWIFY WALLET</span>
            <span className="auth-layout__art-chip" />
          </div>
          <div className="auth-layout__art-balance mono">₹ 24,180.50</div>
          <div className="auth-layout__art-row auth-layout__art-row--bottom">
            <span className="mono">pay@rhea.swify</span>
            <span>Rhea Kapoor</span>
          </div>
        </div>
      </div>

      <div className="auth-layout__panel auth-layout__panel--form">
        <div className="auth-layout__form-wrap">
          <p className="auth-layout__form-eyebrow">{eyebrow}</p>
          <h2 className="auth-layout__form-title">{title}</h2>
          {tagline ? <p className="auth-layout__form-tagline">{tagline}</p> : null}
          {children}
        </div>
      </div>
    </div>
  );
}
