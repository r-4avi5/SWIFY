export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center text-center gap-2.5 py-12 px-6 text-slate">
      {Icon ? (
        <div className="w-[52px] h-[52px] rounded-full grid place-items-center bg-panel-2 text-brass-soft mb-1.5">
          <Icon size={22} strokeWidth={1.6} />
        </div>
      ) : null}
      <p className="m-0 text-ivory font-bold text-base">{title}</p>
      {description ? <p className="m-0 text-sm max-w-xs leading-relaxed">{description}</p> : null}
      {action}
    </div>
  );
}
