import type { SessionInfo } from "@/types";
import { Clock, Radio } from "lucide-react";
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
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border">
        <div className="w-3.5 h-3.5 rounded skeleton-shimmer flex-shrink-0" />
        <div className="flex flex-col gap-1">
          <div className="h-2.5 w-24 rounded skeleton-shimmer" />
          <div className="h-3.5 w-32 rounded skeleton-shimmer" />
        </div>
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
      {/* Icon with live dot */}
      <div className="relative flex-shrink-0">
        <Clock className="w-4 h-4 text-muted-foreground" />
        {isActive && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent pulse-dot" />
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col leading-tight min-w-0">
        <span className="text-[10px] text-muted-foreground font-body uppercase tracking-wider">
          Current Session
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={[
              "text-sm font-display font-semibold truncate",
              isActive ? "text-foreground" : "text-muted-foreground",
            ].join(" ")}
          >
            {label}
          </span>
          {isActive && (
            <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap flex-shrink-0">
              {start} – {end}
            </span>
          )}
        </div>
      </div>

      {/* Live / Off pill */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {isActive && (
          <Radio className="w-3 h-3 text-accent" aria-hidden="true" />
        )}
        <span
          className={[
            "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
            isActive
              ? "bg-accent/15 text-accent border border-accent/25"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          {isActive ? "Live" : "Off"}
        </span>
      </div>
    </motion.div>
  );
}
