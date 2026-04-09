import type { Room, SessionInfo } from "@/types";
import { SESSION_TIMINGS } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

// Derive current session from local time (frontend-computed fallback)
function computeCurrentSession(): SessionInfo {
  const now = new Date();
  const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  for (const s of SESSION_TIMINGS) {
    if (hhmm >= s.start && hhmm < s.end) {
      return {
        sessionId: s.id,
        sessionLabel: s.label,
        startTime: s.start,
        endTime: s.end,
        isActive: true,
      };
    }
  }

  return {
    sessionId: "NONE",
    sessionLabel: "No Active Session",
    startTime: "--:--",
    endTime: "--:--",
    isActive: false,
  };
}

// Seed rooms for local computation when backend is empty
const SEED_ROOMS: Room[] = [
  // R-Block
  ...[
    "R101",
    "R102",
    "R103",
    "R104",
    "R105",
    "R106",
    "R201",
    "R202",
    "R203",
    "R204",
    "R205",
    "R206A",
    "R206B",
    "R207",
    "R301",
    "R302",
    "R303",
    "R304",
    "R305",
  ].map((id) => ({
    id,
    block: "R_BLOCK" as const,
    status: "EMPTY" as const,
    currentSession: "S1_2",
    occupiedBy: undefined,
  })),
  // C-Block
  ...[
    "C101",
    "C102",
    "C103",
    "C104",
    "C105",
    "C201",
    "C202",
    "C203",
    "C204",
    "C205",
    "C206",
    "C207",
    "C301",
    "C302",
    "C303",
    "C304",
  ].map((id) => ({
    id,
    block: "C_BLOCK" as const,
    status: "EMPTY" as const,
    currentSession: "S1_2",
    occupiedBy: undefined,
  })),
  // M-Block
  ...[
    "M101",
    "M102",
    "M103",
    "M104",
    "M201",
    "M202",
    "M203",
    "M204",
    "M301",
    "M302",
    "M303",
  ].map((id) => ({
    id,
    block: "M_BLOCK" as const,
    status: "EMPTY" as const,
    currentSession: "S1_2",
    occupiedBy: undefined,
  })),
];

// Randomly assign some rooms as occupied for realistic demo
function applyRealisticOccupancy(rooms: Room[], sessionId: string): Room[] {
  if (sessionId === "NONE")
    return rooms.map((r) => ({ ...r, status: "EMPTY" as RoomStatus }));
  // Use a deterministic hash of room id + sessionId to toggle occupancy
  return rooms.map((room) => {
    const hash = [...`${room.id}${sessionId}`].reduce(
      (acc, c) => acc + c.charCodeAt(0),
      0,
    );
    const status: "EMPTY" | "OCCUPIED" = hash % 3 === 0 ? "OCCUPIED" : "EMPTY";
    return { ...room, status, currentSession: sessionId };
  });
}

type RoomStatus = "EMPTY" | "OCCUPIED";

export function useRooms(dayOfWeek: number, cluster: string) {
  const { actor, isFetching: actorFetching } = useActor(
    import.meta.env.VITE_CANISTER_ID_BACKEND ?? "",
  );
  const session = computeCurrentSession();

  return useQuery<Room[]>({
    queryKey: ["rooms", dayOfWeek, cluster, session.sessionId],
    queryFn: async () => {
      // Try backend first, fall back to seed data
      try {
        if (actor) {
          const backendRooms = await (
            actor as unknown as {
              getRooms: (day: number, cluster: string) => Promise<Room[]>;
            }
          ).getRooms(dayOfWeek, cluster);
          if (backendRooms && backendRooms.length > 0) return backendRooms;
        }
      } catch {
        // backend method not yet available — use seed data
      }
      return applyRealisticOccupancy(SEED_ROOMS, session.sessionId);
    },
    enabled: !actorFetching,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
}
