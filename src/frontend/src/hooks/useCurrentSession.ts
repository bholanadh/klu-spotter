import type { backendInterface } from "@/backend";
import type { SessionInfo } from "@/types";
import { SESSION_TIMINGS } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

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

export function useCurrentSession() {
  const { actor, isFetching: actorFetching } = useActor(
    import.meta.env.VITE_CANISTER_ID_BACKEND ?? "",
  );

  return useQuery<SessionInfo>({
    queryKey: ["currentSession"],
    queryFn: async () => {
      try {
        if (actor) {
          const backendActor = actor as unknown as backendInterface;
          const backendSession = await backendActor.getCurrentSession();
          if (backendSession) return backendSession as SessionInfo;
        }
      } catch {
        // backend not yet available — compute locally
      }
      return computeCurrentSession();
    },
    enabled: !actorFetching,
    refetchInterval: 30_000,
    staleTime: 30_000,
  });
}
