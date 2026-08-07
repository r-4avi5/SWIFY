import { useEffect, useRef } from "react";
import { Delete } from "lucide-react";

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
    <div className="flex flex-col items-center gap-[18px] relative">
      {label ? <p className="m-0 text-[0.86rem] text-slate text-center">{label}</p> : null}

      <div className="flex gap-3.5">
        {digits.map((d, i) => (
          <span
            key={i}
            className={`w-3.5 h-3.5 rounded-full border-[1.5px] transition-all ${
              d ? "bg-brass border-brass scale-110" : "bg-transparent border-hairline-strong"
            } ${error ? "!border-coral" : ""}`}
          />
        ))}
      </div>

      {error ? <p className="-mt-2 text-[0.8rem] text-coral font-semibold">{error}</p> : null}

      <input
        ref={hiddenRef}
        className="absolute opacity-0 w-px h-px pointer-events-none"
        inputMode="numeric"
        type="password"
        value={value}
        maxLength={length}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
      />

      <div className="grid grid-cols-3 gap-3 w-[204px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => press(String(n))}
            className="w-[60px] h-[60px] rounded-full border border-hairline bg-panel-2 text-ivory text-xl font-bold cursor-pointer grid place-items-center hover:bg-panel-3 active:scale-95 transition"
          >
            {n}
          </button>
        ))}
        <span />
        <button
          type="button"
          onClick={() => press("0")}
          className="w-[60px] h-[60px] rounded-full border border-hairline bg-panel-2 text-ivory text-xl font-bold cursor-pointer grid place-items-center hover:bg-panel-3 active:scale-95 transition"
        >
          0
        </button>
        <button
          type="button"
          onClick={backspace}
          aria-label="Delete digit"
          className="w-[60px] h-[60px] rounded-full border border-hairline bg-panel-2 text-ivory grid place-items-center cursor-pointer hover:bg-panel-3 active:scale-95 transition"
        >
          <Delete size={18} />
        </button>
      </div>
    </div>
  );
}
