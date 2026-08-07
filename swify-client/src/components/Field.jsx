export const inputClass =
  "w-full rounded-[10px] border border-hairline bg-ink-2 text-ivory px-4 py-3 text-[0.98rem] font-display placeholder:text-slate-dim transition-colors hover:border-hairline-strong focus:outline-none focus:border-brass focus:bg-panel";

export const textareaClass = `${inputClass} resize-y min-h-[84px]`;

export default function Field({ label, hint, error, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      {label ? (
        <span className="text-[0.78rem] font-bold tracking-wider uppercase text-slate">{label}</span>
      ) : null}
      {children}
      {error ? (
        <span className="text-[0.78rem] text-coral">{error}</span>
      ) : hint ? (
        <span className="text-[0.78rem] text-slate-dim">{hint}</span>
      ) : null}
    </label>
  );
}
