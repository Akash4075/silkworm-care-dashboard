import { Wind, PowerOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CoolingFanControlProps {
  fanState: number | boolean | null;
  disabled: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function CoolingFanControl({
  fanState,
  disabled,
  onStart,
  onStop,
}: CoolingFanControlProps) {
  const isOn = !!fanState;

  return (
    <div className="sensor-card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-card-foreground">
          Cooling Fan Control
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`h-3 w-3 rounded-full ${
              disabled
                ? "bg-muted-foreground"
                : isOn
                ? "bg-success status-pulse"
                : "bg-muted-foreground"
            }`}
          />
          <span className="text-sm font-medium text-muted-foreground">
            {disabled ? "—" : isOn ? "Running" : "Stopped"}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          className="flex-1 bg-primary hover:bg-primary/90"
          onClick={onStart}
          disabled={disabled || isOn}
        >
          <Wind className="mr-2 h-4 w-4" />
          Start Fan
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onStop}
          disabled={disabled || !isOn}
        >
          <PowerOff className="mr-2 h-4 w-4" />
          Stop Fan
        </Button>
      </div>
    </div>
  );
}
