import "./Loader.css";

export default function Loader({ full = false, label = "Loading" }) {
  return (
    <div className={`loader ${full ? "loader--full" : ""}`}>
      <span className="loader__ring" aria-hidden="true" />
      <span className="loader__label">{label}</span>
    </div>
  );
}
