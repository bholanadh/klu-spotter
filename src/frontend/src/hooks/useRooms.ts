import type { backendInterface } from "@/backend";
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
// Exactly 9 rooms as per spec: R206A, R207, R208 (R-Block), C207, C208, C301 (C-Block), M101, M102, M201 (M-Block)
const SEED_ROOMS: Room[] = [
  // R-Block
  {
    id: "R206A",
    block: "R_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: undefined,
  },
  {
    id: "R207",
    block: "R_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE1234",
  },
  {
    id: "R208",
    block: "R_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: undefined,
  },
  // C-Block
  {
    id: "C207",
    block: "C_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE5678",
  },
  {
    id: "C208",
    block: "C_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: undefined,
  },
  {
    id: "C301",
    block: "C_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE9012",
  },
  // M-Block
  {
    id: "M101",
    block: "M_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: undefined,
  },
  {
    id: "M102",
    block: "M_BLOCK",
    status: "OCCUPIED",
    currentSession: "S1_2",
    occupiedBy: "20BCE3456",
  },
  {
    id: "M201",
    block: "M_BLOCK",
    status: "EMPTY",
    currentSession: "S1_2",
    occupiedBy: undefined,
  },
];

// Deterministic occupancy for demo when backend is empty
function applyRealisticOccupancy(rooms: Room[], sessionId: string): Room[] {
  if (sessionId === "NONE") {
    return rooms.map((r) => ({ ...r, status: "EMPTY" as const }));
  }
  return rooms.map((room) => {
    const hash = [...`${room.id}${sessionId}`].reduce(
      (acc, c) => acc + c.charCodeAt(0),
      0,
    );
    const status: "EMPTY" | "OCCUPIED" = hash % 3 === 0 ? "OCCUPIED" : "EMPTY";
    return { ...room, status, currentSession: sessionId };
  });
}

export function useRooms(dayOfWeek: number, cluster: string) {
  const { actor, isFetching: actorFetching } = useActor(
    import.meta.env.VITE_CANISTER_ID_BACKEND ?? "",
  );
  const session = computeCurrentSession();

  return useQuery<Room[]>({
    queryKey: ["rooms", dayOfWeek, cluster, session.sessionId],
    queryFn: async () => {
      try {
        if (actor) {
          const backendActor = actor as unknown as backendInterface;
          const backendRooms = await backendActor.getRoomsForDay(
            BigInt(dayOfWeek),
            cluster,
          );
          if (backendRooms && backendRooms.length > 0)
            return backendRooms as Room[];
        }
      } catch {
        // backend not yet seeded — fall through to seed data
      }
      return applyRealisticOccupancy(SEED_ROOMS, session.sessionId);
    },
    enabled: !actorFetching,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
}
