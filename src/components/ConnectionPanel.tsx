import { Wifi, WifiOff, Loader2 } from "lucide-react";
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
}

export function ConnectionPanel({
  ipAddress,
  status,
  error,
  onIpChange,
  onConnect,
  onDisconnect,
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
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
