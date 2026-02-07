import { Thermometer, Droplets, Layers, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { SensorCard } from "@/components/SensorCard";
import { MotorControl } from "@/components/MotorControl";
import { useESP32 } from "@/hooks/useESP32";

function getTempStatus(t: number): "normal" | "warning" | "danger" {
  if (t < 20 || t > 35) return "danger";
  if (t < 23 || t > 32) return "warning";
  return "normal";
}

function getHumidityStatus(h: number): "normal" | "warning" | "danger" {
  if (h < 50 || h > 90) return "danger";
  if (h < 60 || h > 85) return "warning";
  return "normal";
}

const Index = () => {
  const esp = useESP32();
  const connected = esp.status === "connected";
  const hasData = connected && esp.data !== null;

  return (
    <div className="min-h-screen bg-background px-4 pb-10">
      <div className="mx-auto max-w-md">
        <DashboardHeader />

        <div className="space-y-4">
          <ConnectionPanel
            ipAddress={esp.ipAddress}
            status={esp.status}
            error={esp.error}
            onIpChange={esp.setIpAddress}
            onConnect={esp.connect}
            onDisconnect={esp.disconnect}
          />

          {/* Sensor readings */}
          <div className="grid grid-cols-2 gap-3">
            <SensorCard
              icon={Thermometer}
              label="Temperature"
              value={hasData ? esp.data!.temperature.toFixed(1) : "—"}
              unit={hasData ? "°C" : undefined}
              status={hasData ? getTempStatus(esp.data!.temperature) : "normal"}
            />
            <SensorCard
              icon={Droplets}
              label="Humidity"
              value={hasData ? esp.data!.humidity.toFixed(0) : "—"}
              unit={hasData ? "%" : undefined}
              status={hasData ? getHumidityStatus(esp.data!.humidity) : "normal"}
            />
          </div>

          <SensorCard
            icon={Layers}
            label="Tray Status"
            value={hasData ? esp.data!.tray : "—"}
          />

          <MotorControl
            motorState={esp.data?.motor ?? null}
            disabled={!connected}
            onStart={() => esp.sendMotorCommand("on")}
            onStop={() => esp.sendMotorCommand("off")}
          />

          {/* Controls */}
          <div className="sensor-card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={esp.refresh}
                disabled={!connected}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto</span>
              <Switch
                checked={esp.autoRefresh}
                onCheckedChange={esp.toggleAutoRefresh}
                disabled={!connected}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
