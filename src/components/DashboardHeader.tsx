import silkwormImg from "@/assets/silkworm-header.png";

export function DashboardHeader() {
  return (
    <header className="flex items-center gap-4 py-6">
      <img
        src={silkwormImg}
        alt="Silkworm on leaf"
        className="h-16 w-16 rounded-xl object-cover shadow-sm"
      />
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">
          Silkworm Farm Monitor
        </h1>
        <p className="text-sm text-muted-foreground">
          ESP32 IoT Dashboard
        </p>
      </div>
    </header>
  );
}
