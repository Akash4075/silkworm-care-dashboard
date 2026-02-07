import type { LucideIcon } from "lucide-react";

interface SensorCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  unit?: string;
  status?: "normal" | "warning" | "danger";
}

export function SensorCard({
  icon: Icon,
  label,
  value,
  unit,
  status = "normal",
}: SensorCardProps) {
  const statusColors = {
    normal: "text-primary",
    warning: "text-warning",
    danger: "text-destructive",
  };

  return (
    <div className="sensor-card flex flex-col items-center text-center gap-2">
      <Icon className={`h-8 w-8 ${statusColors[status]}`} />
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className={`font-heading text-3xl font-bold ${statusColors[status]}`}>
          {value}
        </span>
        {unit && (
          <span className="text-sm text-muted-foreground">{unit}</span>
        )}
      </div>
    </div>
  );
}
