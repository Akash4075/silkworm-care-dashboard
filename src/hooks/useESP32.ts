import { useState, useCallback, useRef, useEffect } from "react";

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface SensorData {
  temperature: number;
  humidity: number;
  light: number;
  gas: number;
  fire: number;
  fan: number;
  motor: number;
  death: number;
  message: string;
}

export interface AppMessage {
  id: string;
  text: string;
  type: "info" | "warning" | "danger";
  timestamp: string;
}

export interface ESP32State {
  status: ConnectionStatus;
  data: SensorData | null;
  error: string | null;
  ipAddress: string;
  autoRefresh: boolean;
  messages: AppMessage[];
  isSimulated: boolean;
}

export function useESP32() {
  const [state, setState] = useState<ESP32State>({
    status: "disconnected",
    data: null,
    error: null,
    ipAddress: "",
    autoRefresh: false,
    messages: [],
    isSimulated: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setIpAddress = useCallback((ip: string) => {
    setState((prev) => ({ ...prev, ipAddress: ip }));
  }, []);

  const fetchData = useCallback(async (ip: string, isManualRefresh: boolean = false) => {
    if (!ip.trim()) return;

    setState((prev) => ({
      ...prev,
      status: prev.status === "disconnected" ? "connecting" : prev.status,
      error: null,
    }));

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // Increased to 10s

      const res = await fetch(`http://${ip}/data`, {
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      // Check for high temperature alert
      if (json.temperature > 35) {
        const id = Date.now().toString();
        setState(prev => {
          if (prev.messages.some(m => m.text.includes("High Temperature") && (Date.now() - new Date(m.timestamp).getTime() < 60000))) {
            return prev;
          }
          return {
            ...prev,
            messages: [
              {
                id,
                text: `High Temperature Alert: ${json.temperature}°C`,
                type: "warning",
                timestamp: new Date().toLocaleTimeString(),
              },
              ...prev.messages,
            ],
          };
        });
      }

      // Check for silkworm death alert
      const isDead = json.death === 1 || json.death === "1" || json.death === true || json.death === "true";
      if (isDead) {
        setState(prev => {
          // Only alert if it just happened, OR if the user manually pressed refresh
          const prevDeath = prev.data?.death as any;
          const prevDead = prevDeath === 1 || prevDeath === "1" || prevDeath === true || prevDeath === "true";
          const justDied = !prevDead;
          if (justDied || isManualRefresh) {
             return {
              ...prev,
              messages: [
                {
                  id: `death-${Date.now()}`,
                  text: "CRITICAL: Silkworm Death Alert Received!",
                  type: "danger",
                  timestamp: new Date().toLocaleTimeString(),
                },
                ...prev.messages
              ]
            };
          }
          return prev;
        });
      }

      setState((prev) => ({
        ...prev,
        status: "connected",
        data: json,
        error: null,
      }));
    } catch (err: any) {
      let message = err.message || "Failed to connect";
      
      if (err.name === "AbortError") {
        message = "Connection timed out (10s). Is the ESP32 online and reachable?";
      } else if (message.includes("Failed to fetch")) {
        message = "Network error. Check if the IP is correct and same WiFi. (CORS/Mixed Content?)";
      }

      setState((prev) => ({
        ...prev,
        status: "error",
        data: null,
        error: `${message} (${err.name || "Error"})`,
      }));
    }
  }, []);

  const connect = useCallback(() => {
    fetchData(state.ipAddress);
  }, [fetchData, state.ipAddress]);

  const refresh = useCallback(() => {
    // Inject fake death message for demo purposes
    setState(prev => ({
      ...prev,
      messages: [
        {
          id: `demo-death-${Date.now()}`,
          text: "Silkworm death found",
          type: "danger",
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev.messages
      ]
    }));

    if (state.ipAddress) fetchData(state.ipAddress, true); // true = manual refresh
  }, [fetchData, state.ipAddress]);

  const sendMotorCommand = useCallback(
    async (command: "on" | "off") => {
      // For demo purposes: immediately log message and update UI gauge
      setState((prev) => ({
        ...prev,
        data: prev.data ? { ...prev.data, motor: command === "on" ? 1 : 0 } : prev.data,
        messages: [
          {
            id: Date.now().toString(),
            text: `Motor turned ${command.toUpperCase()}`,
            type: "info",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.messages,
        ],
      }));

      if (!state.ipAddress) return;

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
        console.error("Motor command ignored for demo purposes", err);
      }
    },
    [state.ipAddress, fetchData]
  );

  const sendFanCommand = useCallback(
    async (command: "on" | "off") => {
      // For demo purposes: immediately log message and update UI gauge
      setState((prev) => ({
        ...prev,
        data: prev.data ? { ...prev.data, fan: command === "on" ? 1 : 0 } : prev.data,
        messages: [
          {
            id: Date.now().toString(),
            text: `Fan turned ${command.toUpperCase()}`,
            type: "info",
            timestamp: new Date().toLocaleTimeString(),
          },
          ...prev.messages,
        ],
      }));

      if (!state.ipAddress) return;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        await fetch(`http://${state.ipAddress}/fan/${command}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        // Refresh data after command
        await fetchData(state.ipAddress);
      } catch (err: any) {
        console.error("Fan command ignored for demo purposes", err);
      }
    },
    [state.ipAddress, fetchData]
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
      isSimulated: false,
    }));
  }, []);

  const startSimulation = useCallback(() => {
    setState((prev) => ({
      ...prev,
      status: "connected",
      isSimulated: true,
      error: null,
      data: {
        temperature: 28.5,
        humidity: 72,
        light: 450,
        gas: 220,
        fire: 0,
        fan: 0,
        motor: 0,
        death: 0,
        message: "Simulation Mode Active",
      },
    }));
  }, []);

  // Auto-refresh interval (for both real and simulated)
  useEffect(() => {
    if (state.autoRefresh && state.status === "connected") {
      intervalRef.current = setInterval(() => {
        if (state.isSimulated) {
          setState((prev) => ({
            ...prev,
            data: prev.data ? {
              ...prev.data,
              temperature: prev.data.temperature + (Math.random() - 0.5),
              humidity: prev.data.humidity + (Math.random() - 0.5) * 2,
              light: Math.floor(prev.data.light + (Math.random() - 0.5) * 10),
              gas: Math.floor(prev.data.gas + (Math.random() - 0.5) * 5),
            } : null,
          }));
        } else if (state.ipAddress) {
          fetchData(state.ipAddress, false); // false = auto refresh
        }
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
    sendFanCommand,
    toggleAutoRefresh,
    disconnect,
    startSimulation,
  };
}
