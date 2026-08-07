export default function Loader({ full = false, label = "Loading" }) {
  return (
    <div
      className={`flex items-center gap-2.5 text-slate text-sm p-6 ${
        full ? "min-h-screen w-full justify-center bg-ink" : ""
      }`}
    >
      <span className="w-[18px] h-[18px] rounded-full border-2 border-panel-3 border-t-brass animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
