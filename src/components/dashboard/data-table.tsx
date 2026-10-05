"use client";

import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  rows,
  onRowClick,
  selectedId,
  emptyLabel,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  onRowClick?: (row: T) => void;
  selectedId?: string | number;
  emptyLabel?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyLabel ?? "No records."} />;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)]"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "border-b border-[var(--border)] last:border-0",
                  onRowClick && "cursor-pointer hover:bg-[var(--surface-secondary)]",
                  selectedId === row.id && "bg-[var(--primary-soft)]"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-3 py-2.5 text-[var(--text-primary)]">
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {rows.map((row) => (
          <li key={row.id}>
            <button
              onClick={() => onRowClick?.(row)}
              className={cn(
                "w-full rounded-[var(--radius-sm)] border border-[var(--border)] p-3 text-start",
                onRowClick && "active:bg-[var(--surface-secondary)]",
                selectedId === row.id && "border-[var(--primary)] bg-[var(--primary-soft)]"
              )}
            >
              {columns.map((col) => (
                <div key={col.key} className="flex items-center justify-between gap-3 py-0.5 text-sm">
                  <span className="text-xs font-medium text-[var(--text-tertiary)]">{col.header}</span>
                  <span className="truncate text-end text-[var(--text-primary)]">{col.render(row)}</span>
                </div>
              ))}
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
