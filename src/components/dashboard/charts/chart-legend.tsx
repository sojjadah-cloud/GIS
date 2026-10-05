import { colorForVar, type ChartColors } from "@/lib/chart-theme";

export function ChartLegend({
  items,
  colors,
}: {
  items: { name: string; value: number; colorVar?: string }[];
  colors: ChartColors;
}) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((item, i) => (
        <li key={item.name} className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{
              backgroundColor: item.colorVar ? colorForVar(item.colorVar, colors) : colors.categorical[i % colors.categorical.length],
            }}
            aria-hidden
          />
          <span className="truncate">{item.name}</span>
          <span className="font-medium text-[var(--text-primary)]">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
