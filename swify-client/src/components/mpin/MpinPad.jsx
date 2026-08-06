import { useEffect, useRef } from "react";
import { Delete } from "lucide-react";
import "./MpinPad.css";

export default function MpinPad({ value, onChange, length = 6, label, error, autoFocus = true }) {
  const hiddenRef = useRef(null);

  useEffect(() => {
    if (autoFocus) hiddenRef.current?.focus();
  }, [autoFocus]);

  const digits = value.split("").concat(Array(length).fill("")).slice(0, length);

  const press = (d) => {
    if (value.length >= length) return;
    onChange(value + d);
  };

  const backspace = () => onChange(value.slice(0, -1));

  return (
    <div className="mpin-pad">
      {label ? <p className="mpin-pad__label">{label}</p> : null}

      <div className={`mpin-pad__dots ${error ? "has-error" : ""}`}>
        {digits.map((d, i) => (
          <span key={i} className={`mpin-pad__dot ${d ? "is-filled" : ""}`} />
        ))}
      </div>

      {error ? <p className="mpin-pad__error">{error}</p> : null}

      <input
        ref={hiddenRef}
        className="mpin-pad__hidden-input"
        inputMode="numeric"
        type="password"
        value={value}
        maxLength={length}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
      />

      <div className="mpin-pad__keys">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button type="button" key={n} onClick={() => press(String(n))}>
            {n}
          </button>
        ))}
        <span />
        <button type="button" onClick={() => press("0")}>0</button>
        <button type="button" onClick={backspace} aria-label="Delete digit">
          <Delete size={18} />
        </button>
      </div>
    </div>
  );
}
