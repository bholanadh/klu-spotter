import { ClusterToggle } from "@/components/ClusterToggle";
import { RoomCard } from "@/components/RoomCard";
import { SessionBadge } from "@/components/SessionBadge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useRooms } from "@/hooks/useRooms";
import { BLOCKS, type ClusterType, type SemesterType } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function getCurrentSemester(): SemesterType {
  const month = new Date().getMonth() + 1;
  return month >= 8 && month <= 12 ? "ODD" : "EVEN";
}

function getDayOfWeek(): number {
  return new Date().getDay();
}

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [semester, setSemester] = useState<SemesterType>(getCurrentSemester());
  const [cluster, setCluster] = useState<ClusterType>("C1");

  const dayOfWeek = getDayOfWeek();
  const isHoliday =
    (cluster === "C1" && dayOfWeek === 6) ||
    (cluster === "C2" && dayOfWeek === 1);

  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  const {
    data: rooms,
    isLoading: roomsLoading,
    dataUpdatedAt,
  } = useRooms(dayOfWeek, cluster);

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  useEffect(() => {
    if (dataUpdatedAt) setLastUpdated(new Date(dataUpdatedAt));
  }, [dataUpdatedAt]);

  const handleSemesterChange = (value: SemesterType) => {
    const actual = getCurrentSemester();
    if (value !== actual) {
      toast.error("Does Not Exist", {
        description: `${value} semester is not currently active.`,
        duration: 4000,
      });
      return;
    }
    setSemester(value);
  };

  const handleClusterChange = (value: ClusterType) => {
    const day = getDayOfWeek();
    if (value === "C1" && day === 6) {
      toast.warning("No Classes Today — C1 Cluster Holiday", {
        description: "C1 cluster observes Saturday as a holiday.",
        duration: 5000,
      });
    } else if (value === "C2" && day === 1) {
      toast.warning("No Classes Today — C2 Cluster Holiday", {
        description: "C2 cluster observes Monday as a holiday.",
        duration: 5000,
      });
    }
    setCluster(value);
  };

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo area */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              aria-label="KLU Logo"
            >
              <span className="text-primary-foreground font-display font-black text-sm leading-none">
                KLU
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-body truncate leading-none">
                KL Deemed to be University
              </p>
              <h1 className="text-base font-display font-bold text-foreground leading-tight truncate">
                KLU Spotter
              </h1>
            </div>
          </div>

          {/* Session badge — hidden on xs */}
          <div className="hidden sm:block">
            <SessionBadge session={session} isLoading={sessionLoading} />
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            data-ocid="logout-btn"
            aria-label="Logout"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-body text-muted-foreground hover:text-foreground hover:bg-secondary transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Session badge on mobile */}
      <div className="sm:hidden px-4 pt-3">
        <SessionBadge session={session} isLoading={sessionLoading} />
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Filter bar */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="flex flex-wrap items-end gap-4 mb-8 p-4 rounded-2xl bg-card border border-border"
        >
          {/* Semester selector */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">
              Semester
            </span>
            <div
              data-ocid="semester-selector"
              aria-label="Select semester"
              className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border"
            >
              {(["EVEN", "ODD"] as SemesterType[]).map((s) => {
                const isActive = semester === s;
                return (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => handleSemesterChange(s)}
                    className="relative px-4 py-1.5 rounded-lg text-sm font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="semester-pill"
                        className="absolute inset-0 rounded-lg bg-primary"
                        transition={{
                          type: "spring",
                          bounce: 0.22,
                          duration: 0.38,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cluster toggle */}
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-body">
              Cluster
            </span>
            <ClusterToggle value={cluster} onChange={handleClusterChange} />
          </div>

          {/* Holiday notice */}
          {isHoliday && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30"
            >
              <span className="text-sm font-semibold text-primary">
                🎉 Holiday — {cluster} Cluster
              </span>
            </motion.div>
          )}
        </motion.section>

        {/* Room grid by block */}
        {roomsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                key={i}
                className="rounded-xl bg-card border border-border p-4 h-24 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {BLOCKS.map((block) => {
              const blockRooms = (rooms ?? []).filter(
                (r) => r.block === block.key,
              );
              if (blockRooms.length === 0) return null;

              const emptyCount = isHoliday
                ? 0
                : blockRooms.filter((r) => r.status === "EMPTY").length;

              return (
                <section
                  key={block.key}
                  data-ocid={`block-${block.shortLabel.toLowerCase()}`}
                >
                  {/* Block header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                      <span className="text-sm font-display font-black text-primary">
                        {block.shortLabel}
                      </span>
                    </div>
                    <h2 className="text-lg font-display font-bold text-foreground">
                      {block.label}
                    </h2>
                    <span className="text-sm text-muted-foreground font-body">
                      {isHoliday ? (
                        <span className="text-muted-foreground/60">
                          Holiday
                        </span>
                      ) : (
                        <>
                          <span className="text-accent font-semibold">
                            {emptyCount}
                          </span>
                          <span> / {blockRooms.length} empty</span>
                        </>
                      )}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>

                  {/* Cards grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {blockRooms.map((room, idx) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        index={idx}
                        isHoliday={isHoliday}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {/* Live update footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground font-body">
          <RefreshCw className="w-3 h-3" />
          <span>
            Room data updates live every 30s — last updated{" "}
            {lastUpdated.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </main>

      {/* Branding footer */}
      <footer className="bg-muted/40 border-t border-border py-4 px-4">
        <p className="text-center text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
