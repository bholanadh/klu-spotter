import type { Room } from "@/types";
import { Users } from "lucide-react";
import { motion } from "motion/react";

interface RoomCardProps {
  room: Room;
  index: number;
  isHoliday?: boolean;
}

// Deterministic pseudo-capacity based on room ID
function getRoomMeta(id: string): { capacity: number; utilization: number } {
  const hash = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  const capacity = 20 + (hash % 40); // 20–60
  return { capacity, utilization: 0 };
}

export function RoomCard({ room, index, isHoliday }: RoomCardProps) {
  const isEmpty = room.status === "EMPTY" && !isHoliday;
  const isOccupied = room.status === "OCCUPIED" && !isHoliday;
  const { capacity } = getRoomMeta(room.id);

  // Simulate utilization as 0 for empty, partial for occupied
  const utilization = isOccupied
    ? Math.round(
        capacity * 0.4 +
          (([...room.id].reduce((a, c) => a + c.charCodeAt(0), 0) % 40) / 100) *
            capacity *
            0.6,
      )
    : 0;

  const utilPct =
    capacity > 0 ? Math.min(100, (utilization / capacity) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay: Math.min(index * 0.04, 0.6),
        ease: [0.4, 0, 0.2, 1],
      }}
      data-ocid={`room-card-${room.id.toLowerCase()}`}
      className={[
        "relative flex flex-col gap-2 rounded-xl p-3.5 border transition-smooth cursor-default select-none overflow-hidden",
        isHoliday
          ? "bg-card/30 border-border/20 opacity-40"
          : isEmpty
            ? "bg-card border-border/80 room-empty-glow hover:border-accent/60"
            : "bg-card border-border/80 room-occupied-glow hover:border-primary/60",
      ].join(" ")}
    >
      {/* Top row: icon + status badge */}
      <div className="flex items-start justify-between gap-1">
        <div
          className={[
            "w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0",
            isHoliday
              ? "bg-muted/20"
              : isEmpty
                ? "bg-accent/10"
                : "bg-primary/15",
          ].join(" ")}
        >
          <Users
            className={[
              "w-3.5 h-3.5",
              isHoliday
                ? "text-muted-foreground/30"
                : isEmpty
                  ? "text-accent"
                  : "text-primary",
            ].join(" ")}
          />
        </div>

        {/* Status badge */}
        {isHoliday ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-muted/20 text-muted-foreground/40">
            HOLIDAY
          </span>
        ) : isEmpty ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-accent/15 text-accent border border-accent/25">
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
            EMPTY
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-primary/15 text-primary border border-primary/25">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            OCCUPIED
          </span>
        )}
      </div>

      {/* Room ID */}
      <span
        className={[
          "text-xl font-display font-black tracking-tight leading-none",
          isHoliday ? "text-muted-foreground/30" : "text-foreground",
        ].join(" ")}
      >
        {room.id}
      </span>

      {/* Capacity / Utilization */}
      <div className="flex flex-col gap-1.5 mt-auto">
        <div className="flex justify-between text-[10px] text-muted-foreground font-body">
          <span>Capacity: {capacity}</span>
          <span>Utilization: {utilization}</span>
        </div>
        <div className="util-bar-track">
          <div
            className={
              isEmpty ? "util-bar-fill-empty" : "util-bar-fill-occupied"
            }
            style={{ width: `${utilPct}%` }}
          />
        </div>
      </div>

      {/* Subtle occupied-by */}
      {isOccupied && room.occupiedBy && (
        <p className="text-[10px] text-muted-foreground truncate max-w-full leading-none -mt-1">
          {room.occupiedBy}
        </p>
      )}

      {/* Subtle bg glow overlay */}
      {isEmpty && !isHoliday && (
        <div className="absolute inset-0 pointer-events-none panel-glow-green rounded-xl" />
      )}
    </motion.div>
  );
}
