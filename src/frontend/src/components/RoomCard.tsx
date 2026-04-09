import type { Room } from "@/types";
import { motion } from "motion/react";

interface RoomCardProps {
  room: Room;
  index: number;
  isHoliday?: boolean;
}

export function RoomCard({ room, index, isHoliday }: RoomCardProps) {
  const isEmpty = room.status === "EMPTY" && !isHoliday;
  const isOccupied = room.status === "OCCUPIED" && !isHoliday;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: [0.4, 0, 0.2, 1],
      }}
      data-ocid={`room-card-${room.id.toLowerCase()}`}
      className={`
        relative flex flex-col items-center justify-between
        rounded-xl p-4 border
        transition-smooth cursor-default select-none
        ${
          isHoliday
            ? "bg-card/40 border-border/30"
            : isEmpty
              ? "bg-card border-border room-empty-glow hover:border-accent/50"
              : "bg-card border-border room-occupied-glow hover:border-primary/50"
        }
      `}
    >
      {/* Room number */}
      <span
        className={`
          text-2xl font-display font-black tracking-tight leading-none
          ${isHoliday ? "text-muted-foreground/40" : "text-foreground"}
        `}
      >
        {room.id}
      </span>

      {/* Status badge */}
      <div className="mt-3">
        {isHoliday ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-muted/30 text-muted-foreground/50">
            HOLIDAY
          </span>
        ) : isEmpty ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-accent/20 text-accent">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            EMPTY
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-primary/15 text-primary">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            OCCUPIED
          </span>
        )}
      </div>

      {/* Subtle occupied-by label */}
      {isOccupied && room.occupiedBy && (
        <p className="mt-2 text-xs text-muted-foreground truncate max-w-full text-center">
          {room.occupiedBy}
        </p>
      )}
    </motion.div>
  );
}
