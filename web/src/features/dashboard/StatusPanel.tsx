import { StatusStatGrid } from "./StatusStatGrid";
import { SystemInfoCard } from "./SystemInfoCard";

export function StatusPanel() {
  return (
    <div className="space-y-5">
      <StatusStatGrid />
      <SystemInfoCard />
    </div>
  );
}
