import { Thermometer, Droplets, Layers, RefreshCw, LayoutGrid, MessageSquare, Sun, Flame, Activity, Wind, Skull, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/DashboardHeader";
import { ConnectionPanel } from "@/components/ConnectionPanel";
import { SensorCard } from "@/components/SensorCard";
import { MotorControl } from "@/components/MotorControl";
import { CoolingFanControl } from "@/components/CoolingFanControl";
import { useESP32, AppMessage } from "@/hooks/useESP32";

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

function getFireStatus(f: number): "normal" | "danger" {
  return f === 0 ? "danger" : "normal";
}

function getGasStatus(g: number): "normal" | "warning" | "danger" {
  if (g > 800) return "danger";
  if (g > 500) return "warning";
  return "normal";
}

const MessageItem = ({ message }: { message: AppMessage }) => {
  const bgColor = {
    info: "bg-primary/10 border-primary/20",
    warning: "bg-warning/10 border-warning/20",
    danger: "bg-destructive/10 border-destructive/20",
  }[message.type];

  const textColor = {
    info: "text-primary",
    warning: "text-warning-foreground",
    danger: "text-destructive",
  }[message.type];

  const Icon = {
    info: MessageSquare,
    warning: AlertTriangle,
    danger: Skull,
  }[message.type];

  return (
    <div className={`p-4 rounded-xl border ${bgColor} mb-3 flex items-start gap-4 transition-all animate-in fade-in slide-in-from-top-2`}>
      <div className={`mt-1 p-2 rounded-lg bg-background/50 ${textColor}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <p className={`font-medium ${textColor}`}>{message.text}</p>
          <span className="text-[10px] uppercase font-bold opacity-50">{message.timestamp}</span>
        </div>
      </div>
    </div>
  );
};

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
            onStartSimulation={esp.startSimulation}
          />

          <Tabs defaultValue="monitor" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="monitor" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <LayoutGrid className="mr-2 h-4 w-4" />
                Monitor
              </TabsTrigger>
              <TabsTrigger value="messages" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="space-y-4 mt-0 border-none p-0 outline-none animate-in fade-in zoom-in-95 duration-300">
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
                <SensorCard
                  icon={Sun}
                  label="Light"
                  value={hasData ? esp.data!.light.toString() : "—"}
                />
                <SensorCard
                  icon={Flame}
                  label="Fire Status"
                  value={hasData ? (esp.data!.fire === 0 ? "FIRE!" : "No Fire Detect") : "—"}
                  status={hasData ? getFireStatus(esp.data!.fire) : "normal"}
                />
                <SensorCard
                  icon={Activity}
                  label="Gas Level"
                  value={hasData ? esp.data!.gas.toString() : "—"}
                  status={hasData ? getGasStatus(esp.data!.gas) : "normal"}
                />
                <SensorCard
                  icon={hasData && esp.data!.death === 1 ? Skull : Layers}
                  label="Tray Status"
                  value={hasData ? (esp.data!.death === 1 ? "ALARM" : "Normal") : "—"}
                  status={hasData && esp.data!.death === 1 ? "danger" : "normal"}
                />
              </div>

              <MotorControl
                motorState={esp.data?.motor ?? null}
                disabled={false}
                onStart={() => esp.sendMotorCommand("on")}
                onStop={() => esp.sendMotorCommand("off")}
              />

              <CoolingFanControl
                fanState={esp.data?.fan ?? null}
                disabled={false}
                onStart={() => esp.sendFanCommand("on")}
                onStop={() => esp.sendFanCommand("off")}
              />

              {/* Controls */}
              <div className="sensor-card flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={esp.refresh}
                    className="rounded-xl"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground font-medium">Auto</span>
                  <Switch
                    checked={esp.autoRefresh}
                    onCheckedChange={esp.toggleAutoRefresh}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages" className="space-y-4 mt-0 border-none p-0 outline-none animate-in fade-in zoom-in-95 duration-300">
               <div className="sensor-card min-h-[400px]">
                <div className="flex items-center justify-between mb-6 border-b pb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <h2 className="font-heading text-lg font-semibold text-card-foreground">
                      Device Messages
                    </h2>
                  </div>
                  {hasData && (
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-primary/10 text-primary">
                      Status: {esp.data!.message}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {esp.messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                      <p className="italic">No messages received yet.</p>
                    </div>
                  ) : (
                    esp.messages.map((msg) => (
                      <MessageItem key={msg.id} message={msg} />
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
