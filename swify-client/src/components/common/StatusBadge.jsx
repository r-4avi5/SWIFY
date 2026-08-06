import "./StatusBadge.css";

// tone: "success" | "warning" | "danger" | "neutral"
export default function StatusBadge({ tone = "neutral", children }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
