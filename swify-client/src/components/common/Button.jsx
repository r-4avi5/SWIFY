import "./Button.css";

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
      className={`btn btn--${variant} btn--${size} ${loading ? "is-loading" : ""} ${className}`}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className="btn__spinner" aria-hidden="true" /> : null}
      <span className="btn__label">{children}</span>
    </As>
  );
}
