import { TriangleAlert } from "lucide-react";

export function AlertBanner({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      role="note"
      className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--danger)]/30 bg-[var(--danger-soft)] p-4"
    >
      <TriangleAlert className="h-5 w-5 shrink-0 text-[var(--danger)]" aria-hidden />
      <div>
        <p className="mb-1 text-sm font-semibold text-[var(--danger)]">{title}</p>
        <ul className="space-y-0.5">
          {items.map((item) => (
            <li key={item} className="text-sm text-[var(--text-secondary)]">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
