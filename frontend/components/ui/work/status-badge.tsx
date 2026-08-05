type StatusBadgeProps = {
  status: string;
};

const STATUS_MAP: Record<
  "todo" | "in_progress" | "done",
  { label: string; className: string }
> = {
  todo: {
    label: "Todo",
    className: "border-sky-300/40 bg-sky-400/10 text-sky-100",
  },
  in_progress: {
    label: "In progress",
    className: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  },
  done: {
    label: "Done",
    className: "border-emerald-300/40 bg-emerald-400/10 text-emerald-200",
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = (
    status in STATUS_MAP ? status : "todo"
  ) as keyof typeof STATUS_MAP;
  const { label, className } = STATUS_MAP[key];
  return <p className={`sw-tag-label ${className}`}>{label}</p>;
}

export default StatusBadge;
