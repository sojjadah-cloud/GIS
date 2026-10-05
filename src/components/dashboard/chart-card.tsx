import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";
import { ChartCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  action,
  loading,
  empty,
  emptyLabel,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  loading?: boolean;
  empty?: boolean;
  emptyLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  if (loading) return <ChartCardSkeleton />;

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardBody className={cn("flex-1", bodyClassName)}>
        {empty ? <EmptyState title={emptyLabel ?? "No data available."} /> : children}
      </CardBody>
    </Card>
  );
}
