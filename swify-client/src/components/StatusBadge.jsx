const TONES = {
  success: "bg-signal-soft text-signal",
  warning: "bg-[rgba(203,163,92,0.16)] text-brass-soft",
  danger: "bg-coral-soft text-coral",
  neutral: "bg-panel-3 text-slate",
};

// tone: "success" | "warning" | "danger" | "neutral"
export default function StatusBadge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.72rem] font-extrabold tracking-wider uppercase before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:bg-current ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
