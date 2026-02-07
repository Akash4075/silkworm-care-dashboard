import { useState, useCallback, useRef, useEffect } from "react";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface SensorData {
  temperature: number;
  humidity: number;
  motor: string;
  tray: string;
}

export interface ESP32State {
  status: ConnectionStatus;
  data: SensorData | null;
  error: string | null;
  ipAddress: string;
  autoRefresh: boolean;
}

export function useESP32() {
  const [state, setState] = useState<ESP32State>({
    status: "disconnected",
    data: null,
    error: null,
    ipAddress: "",
    autoRefresh: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setIpAddress = useCallback((ip: string) => {
    setState((prev) => ({ ...prev, ipAddress: ip }));
  }, []);

  const fetchData = useCallback(async (ip: string) => {
    if (!ip.trim()) return;

    setState((prev) => ({
      ...prev,
      status: prev.status === "disconnected" ? "connecting" : prev.status,
      error: null,
    }));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`http://${ip}/data`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      // Validate expected fields
      if (
        typeof json.temperature !== "number" ||
        typeof json.humidity !== "number" ||
        typeof json.motor !== "string" ||
        typeof json.tray !== "string"
      ) {
        throw new Error("Invalid data format from device");
      }

      setState((prev) => ({
        ...prev,
        status: "connected",
        data: {
          temperature: json.temperature,
          humidity: json.humidity,
          motor: json.motor,
          tray: json.tray,
        },
        error: null,
      }));
    } catch (err: any) {
      const message =
        err.name === "AbortError"
          ? "Connection timed out"
          : err.message || "Failed to connect";

      setState((prev) => ({
        ...prev,
        status: "error",
        data: null,
        error: message,
      }));
    }
  }, []);

  const connect = useCallback(() => {
    fetchData(state.ipAddress);
  }, [fetchData, state.ipAddress]);

  const refresh = useCallback(() => {
    if (state.ipAddress) fetchData(state.ipAddress);
  }, [fetchData, state.ipAddress]);

  const sendMotorCommand = useCallback(
    async (command: "on" | "off") => {
      if (!state.ipAddress || state.status !== "connected") return;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch(`http://${state.ipAddress}/motor/${command}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        // Refresh data after command
        await fetchData(state.ipAddress);
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          error: `Motor command failed: ${err.message || "Unknown error"}`,
        }));
      }
    },
    [state.ipAddress, state.status, fetchData]
  );

  const toggleAutoRefresh = useCallback(() => {
    setState((prev) => ({ ...prev, autoRefresh: !prev.autoRefresh }));
  }, []);

  const disconnect = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "disconnected",
      data: null,
      error: null,
      autoRefresh: false,
    }));
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (state.autoRefresh && state.status === "connected" && state.ipAddress) {
      intervalRef.current = setInterval(() => {
        fetchData(state.ipAddress);
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.autoRefresh, state.status, state.ipAddress, fetchData]);

  return {
    ...state,
    setIpAddress,
    connect,
    refresh,
    sendMotorCommand,
    toggleAutoRefresh,
    disconnect,
  };
}
