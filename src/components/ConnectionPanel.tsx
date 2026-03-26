import { Wifi, WifiOff, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ConnectionStatus } from "@/hooks/useESP32";

interface ConnectionPanelProps {
  ipAddress: string;
  status: ConnectionStatus;
  error: string | null;
  onIpChange: (ip: string) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onStartSimulation: () => void;
}

export function ConnectionPanel({
  ipAddress,
  status,
  error,
  onIpChange,
  onConnect,
  onDisconnect,
  onStartSimulation,
}: ConnectionPanelProps) {
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  return (
    <div className="sensor-card space-y-3">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="h-5 w-5 text-success" />
        ) : (
          <WifiOff className="h-5 w-5 text-muted-foreground" />
        )}
        <h2 className="font-heading text-lg font-semibold text-card-foreground">
          Device Connection
        </h2>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="ESP32 IP (e.g. 192.168.1.100)"
          value={ipAddress}
          onChange={(e) => onIpChange(e.target.value)}
          disabled={isConnected || isConnecting}
          className="font-body"
        />
        {isConnected ? (
          <Button variant="outline" onClick={onDisconnect}>
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            disabled={!ipAddress.trim() || isConnecting}
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting
              </>
            ) : (
              "Connect"
            )}
          </Button>
        )}
      </div>

      {status === "connecting" && (
        <p className="text-sm text-muted-foreground">
          Connecting to Silkworm Device...
        </p>
      )}
      
      {status === "error" && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-2">
          <p className="text-xs text-destructive font-semibold mb-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Connection Hint:
          </p>
          <ul className="text-[10px] text-destructive/80 space-y-1 ml-4 list-disc">
            <li>Is your laptop on the <b>SAME Wi-Fi</b> as the ESP32?</li>
            <li>Check Arduino Serial Monitor for the <b>Correct IP</b>.</li>
            <li>If your laptop IP starts with <b>10.102...</b>, the ESP32 IP must also start with <b>10.102...</b></li>
          </ul>
        </div>
      )}

      {error && !isConnecting && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
