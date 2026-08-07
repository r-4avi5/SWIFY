const VARIANTS = {
  primary:
    "bg-gradient-to-br from-brass-soft to-brass text-[#241a08] shadow-[0_14px_30px_-14px_rgba(203,163,92,0.55)] hover:shadow-[0_18px_34px_-14px_rgba(203,163,92,0.7)] hover:-translate-y-px",
  ghost:
    "bg-transparent border border-hairline-strong text-ivory hover:border-brass hover:text-brass-soft",
  subtle: "bg-panel-2 text-ivory hover:bg-panel-3",
  danger: "bg-coral-soft text-coral hover:bg-coral/20",
};

const SIZES = {
  sm: "h-[38px] text-sm px-4",
  md: "h-12 text-[0.95rem] px-5",
  lg: "h-14 text-[1.02rem] px-6",
};

export default function Button({
  as: As = "button",
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className = "",
  ...rest
}) {
  return (
    <As
      className={`relative inline-flex items-center justify-center gap-2 rounded-full font-display font-bold whitespace-nowrap cursor-pointer transition-all duration-150 disabled:opacity-55 disabled:cursor-not-allowed disabled:translate-y-0 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-black/25 border-t-current animate-spin" aria-hidden="true" />
      ) : null}
      <span className={loading ? "opacity-55" : ""}>{children}</span>
    </As>
  );
}
