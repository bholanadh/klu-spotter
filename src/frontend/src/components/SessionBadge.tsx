import type { SessionInfo } from "@/types";
import { Clock } from "lucide-react";
import { motion } from "motion/react";

interface SessionBadgeProps {
  session: SessionInfo | undefined;
  isLoading?: boolean;
}

function formatTime(hhmm: string): string {
  if (hhmm === "--:--") return hhmm;
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export function SessionBadge({ session, isLoading }: SessionBadgeProps) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border animate-pulse">
        <div className="w-4 h-4 rounded bg-muted" />
        <div className="h-4 w-32 rounded bg-muted" />
      </div>
    );
  }

  const isActive = session?.isActive ?? false;
  const label = session?.sessionLabel ?? "No Active Session";
  const start = formatTime(session?.startTime ?? "--:--");
  const end = formatTime(session?.endTime ?? "--:--");

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      data-ocid="session-badge"
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-card border border-border"
    >
      <div className="relative flex items-center justify-center">
        <Clock className="w-4 h-4 text-muted-foreground" />
        {isActive && (
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
        )}
      </div>

      <div className="flex flex-col leading-tight">
        <span className="text-xs text-muted-foreground font-body uppercase tracking-wider">
          Current Session
        </span>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-display font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}
          >
            {label}
          </span>
          {isActive && (
            <span className="text-xs font-mono text-muted-foreground">
              {start} – {end}
            </span>
          )}
        </div>
      </div>

      <span
        className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${
          isActive
            ? "bg-accent/20 text-accent"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isActive ? "Live" : "Off"}
      </span>
    </motion.div>
  );
}
