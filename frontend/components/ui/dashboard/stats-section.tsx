import { StatBox } from "./stat-box";

type StatsSectionProps = {
  totalWorks: number | null;
};

export function StatsSection({ totalWorks }: StatsSectionProps) {
  return (
    <section aria-label="Writing statistics" className="sw-stat-grid">
      <StatBox
        icon="work"
        tone="blue"
        label="Works"
        description="Your writing projects"
        value={totalWorks === null ? <span aria-label="Work count unavailable">&mdash;</span> : totalWorks}
      />
      <StatBox
        icon="edit"
        tone="green"
        label="Total Words"
        description="Word tracking coming soon"
        placeholder
      />
      <StatBox
        icon="target"
        tone="gold"
        label="Goal Progress"
        description="Writing goals coming soon"
        placeholder
        showProgressPlaceholder
      />
    </section>
  );
}
