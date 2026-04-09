import { ClusterToggle } from "@/components/ClusterToggle";
import { RoomCard } from "@/components/RoomCard";
import { SessionBadge } from "@/components/SessionBadge";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentSession } from "@/hooks/useCurrentSession";
import { useRooms } from "@/hooks/useRooms";
import {
  BLOCKS,
  type Block,
  type ClusterType,
  type Room,
  type SemesterType,
} from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LogOut, RefreshCw, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTS(d: Date) {
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Auto-detect semester by calendar month */
function getDefaultSemester(): SemesterType {
  const m = new Date().getMonth() + 1;
  return m >= 8 && m <= 12 ? "ODD" : "EVEN";
}

// ── sub-components ────────────────────────────────────────────────────────────

function KluLogo() {
  return (
    <div
      className="flex items-center gap-2.5 flex-shrink-0"
      aria-label="KLU Spotter"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect width="28" height="28" rx="7" fill="oklch(0.62 0.22 25)" />
        <path
          d="M8 5v18M8 14l7-9M8 14l7 9"
          stroke="white"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-display font-black tracking-tight text-primary">
          KLU
        </span>
        <span className="text-base font-display font-semibold text-muted-foreground">
          Spotter
        </span>
      </div>
    </div>
  );
}

interface SemToggleProps {
  value: SemesterType;
  onChange: (v: SemesterType) => void;
}

function SemesterToggle({ value, onChange }: SemToggleProps) {
  const opts: { id: SemesterType; label: string }[] = [
    { id: "ODD", label: "Odd" },
    { id: "EVEN", label: "Even" },
  ];
  return (
    <div
      data-ocid="semester-toggle"
      className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border"
      aria-label="Select semester"
    >
      {opts.map(({ id, label }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            data-ocid={`semester-btn-${id.toLowerCase()}`}
            className="relative px-3.5 py-1.5 rounded-lg text-xs font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted"
          >
            {isActive && (
              <motion.span
                layoutId="semester-pill"
                className="absolute inset-0 rounded-lg bg-card border border-border shadow-sm"
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
              />
            )}
            <span
              className={[
                "relative z-10 transition-colors duration-200",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Animated empty-room count chip for the header
function EmptyChip({ count }: { count: number }) {
  return (
    <motion.div
      key={count}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 420, damping: 24 }}
      data-ocid="total-empty-count"
      aria-live="polite"
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20"
    >
      <span className="w-2 h-2 rounded-full bg-accent pulse-dot flex-shrink-0" />
      <span className="text-sm font-display font-bold text-accent">
        {count}
      </span>
      <span className="text-xs font-body text-muted-foreground">empty</span>
    </motion.div>
  );
}

// Block section with header + responsive card grid
interface BlockSectionProps {
  block: (typeof BLOCKS)[number];
  rooms: Room[];
  isHoliday: boolean;
  isLoading: boolean;
  globalOffset: number;
}

function BlockSection({
  block,
  rooms,
  isHoliday,
  isLoading,
  globalOffset,
}: BlockSectionProps) {
  const blockRooms = rooms.filter((r) => r.block === block.key);
  const emptyCount = isHoliday
    ? 0
    : blockRooms.filter((r) => r.status === "EMPTY").length;
  const total = blockRooms.length;

  return (
    <section
      data-ocid={`block-${block.shortLabel.toLowerCase()}`}
      aria-label={`${block.label} rooms`}
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-display font-black text-primary">
            {block.shortLabel}
          </span>
        </div>
        <h2 className="text-sm font-display font-bold uppercase tracking-[0.1em] text-foreground whitespace-nowrap">
          {block.label}
        </h2>
        {/* Empty / total badge */}
        <span
          data-ocid={`block-count-${block.key.toLowerCase()}`}
          className="text-[11px] font-mono px-2.5 py-0.5 rounded-full border whitespace-nowrap"
          style={{
            background: isHoliday
              ? "oklch(0.19 0.003 25)"
              : "oklch(0.8 0.27 142 / 0.12)",
            borderColor: isHoliday
              ? "oklch(0.22 0.005 25)"
              : "oklch(0.8 0.27 142 / 0.25)",
            color: isHoliday ? "oklch(0.56 0 0)" : "oklch(0.8 0.27 142)",
          }}
        >
          {emptyCount} empty / {total} total
        </span>
        <div className="flex-1 h-px bg-border/40" />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"].map((k) => (
            <div
              key={k}
              className="h-[116px] rounded-xl skeleton-shimmer border border-border/20"
            />
          ))}
        </div>
      ) : blockRooms.length === 0 ? null : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {blockRooms.map((room, i) => (
            <RoomCard
              key={room.id}
              room={room}
              index={globalOffset + i}
              isHoliday={isHoliday}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [semester, setSemester] = useState<SemesterType>(getDefaultSemester);
  const [cluster, setCluster] = useState<ClusterType>("C1");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const dayOfWeek = useMemo(() => new Date().getDay(), []);

  const isC1Holiday = cluster === "C1" && dayOfWeek === 6; // Sat
  const isC2Holiday = cluster === "C2" && dayOfWeek === 1; // Mon
  const isSunday = dayOfWeek === 0;
  const isHoliday = isC1Holiday || isC2Holiday || isSunday;

  const { data: session, isLoading: sessionLoading } = useCurrentSession();
  const {
    data: rooms,
    isLoading: roomsLoading,
    isError,
    dataUpdatedAt,
    refetch,
  } = useRooms(dayOfWeek, cluster);

  // Sync lastUpdated whenever rooms data timestamp changes
  const prevUpdatedAt = useRef(dataUpdatedAt);
  useEffect(() => {
    if (dataUpdatedAt && dataUpdatedAt !== prevUpdatedAt.current) {
      setLastUpdated(new Date(dataUpdatedAt));
      prevUpdatedAt.current = dataUpdatedAt;
    }
  }, [dataUpdatedAt]);

  const allRooms = rooms ?? [];
  const totalEmpty = isHoliday
    ? 0
    : allRooms.filter((r) => r.status === "EMPTY").length;
  const occupancyPct = useMemo(() => {
    if (!allRooms.length || isHoliday) return 0;
    return Math.round(
      (allRooms.filter((r) => r.status === "OCCUPIED").length /
        allRooms.length) *
        100,
    );
  }, [allRooms, isHoliday]);

  // Pre-compute global offsets for stagger animation
  const globalOffsets = useMemo(() => {
    const offsets: Record<Block, number> = {
      R_BLOCK: 0,
      C_BLOCK: 0,
      M_BLOCK: 0,
    };
    let running = 0;
    for (const b of BLOCKS) {
      offsets[b.key] = running;
      running += allRooms.filter((r) => r.block === b.key).length;
    }
    return offsets;
  }, [allRooms]);

  // Semester change: show error on Sunday; show error if semester doesn't match current
  const handleSemesterChange = useCallback(
    (v: SemesterType) => {
      if (isSunday) {
        toast.error("Does Not Exist — No sessions today", {
          duration: 5000,
          icon: "🚫",
        });
        return;
      }
      const actual = getDefaultSemester();
      if (v !== actual) {
        toast.error("Does Not Exist", {
          description: `${v} semester is not currently active.`,
          duration: 4500,
        });
        return;
      }
      setSemester(v);
    },
    [isSunday],
  );

  // Cluster change: warn about cluster holidays
  const handleClusterChange = useCallback(
    (v: ClusterType) => {
      if (v === "C1" && dayOfWeek === 6) {
        toast.warning("C1 cluster is off today (Saturday holiday)", {
          duration: 5000,
          icon: "📅",
        });
      } else if (v === "C2" && dayOfWeek === 1) {
        toast.warning("C2 cluster is off today (Monday holiday)", {
          duration: 5000,
          icon: "📅",
        });
      }
      setCluster(v);
    },
    [dayOfWeek],
  );

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/" });
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "oklch(0.97 0 0)" }}
    >
      {/* ════════════════════ STICKY HEADER (white zone) ════════════════════ */}
      <header
        data-ocid="dashboard-header"
        className="sticky top-0 z-40 border-b shadow-subtle"
        style={{
          background: "oklch(0.99 0 0)",
          borderColor: "oklch(0.88 0 0)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[58px] flex items-center justify-between gap-4">
          {/* Branding */}
          <KluLogo />

          {/* Center: session badge (hidden on xs) */}
          <div className="hidden md:flex flex-1 justify-center">
            <SessionBadge session={session} isLoading={sessionLoading} />
          </div>

          {/* Right: empty chip + logout */}
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <EmptyChip count={totalEmpty} />
            <button
              type="button"
              data-ocid="logout-btn"
              onClick={handleLogout}
              aria-label="Sign out"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-body transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              style={{ color: "oklch(0.45 0 0)" }}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-display">
                Logout
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════ FILTER BAR (white zone, below header) ═══════════ */}
      <div
        className="border-b"
        style={{
          background: "oklch(0.97 0 0)",
          borderColor: "oklch(0.88 0 0)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-3">
          {/* Semester */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-body text-muted-foreground uppercase tracking-wider">
              Semester
            </span>
            <SemesterToggle value={semester} onChange={handleSemesterChange} />
          </div>

          <div className="hidden sm:block w-px h-6 bg-border" aria-hidden />

          {/* Cluster */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-[11px] font-body text-muted-foreground uppercase tracking-wider">
              Cluster
            </span>
            <ClusterToggle value={cluster} onChange={handleClusterChange} />
          </div>

          {/* Holiday notice badge */}
          <AnimatePresence>
            {isHoliday && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.22 }}
                data-ocid="holiday-notice"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary text-xs font-display font-semibold"
              >
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {isSunday
                  ? "Sunday — No Classes"
                  : isC1Holiday
                    ? "C1 Saturday Holiday"
                    : "C2 Monday Holiday"}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Session badge on mobile */}
          <div className="md:hidden w-full mt-0.5">
            <SessionBadge session={session} isLoading={sessionLoading} />
          </div>
        </div>
      </div>

      {/* ═══════════════════ MAIN CONTENT (dark room grid zone) ════════════ */}
      <main
        className="flex-1 dark"
        style={{ background: "oklch(0.1 0 0)", color: "oklch(0.95 0 0)" }}
      >
        {/* Spotlight + Quick Status panels */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-5 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Spotlight */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38 }}
              className="md:col-span-2 relative rounded-2xl overflow-hidden border border-border bg-card min-h-[150px] flex flex-col justify-end p-5"
              data-ocid="spotlight-panel"
            >
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(45deg, transparent, transparent 24px, currentColor 24px, currentColor 25px)",
                }}
              />
              <div aria-hidden className="absolute inset-0 panel-glow-red" />
              <div aria-hidden className="absolute top-4 right-5 opacity-15">
                <Zap className="w-28 h-28 text-primary" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-widest mb-1">
                  Spotlight
                </p>
                <div className="flex items-end gap-3">
                  <span className="font-display font-black text-5xl text-foreground leading-none">
                    {occupancyPct}
                    <span className="text-2xl text-muted-foreground">%</span>
                  </span>
                  <div className="mb-0.5">
                    <p className="text-sm font-display font-bold text-foreground">
                      {isHoliday ? "Holiday" : "Live Occupancy"}
                    </p>
                    <p className="text-xs text-muted-foreground font-body">
                      {isHoliday
                        ? `${cluster} cluster — no classes`
                        : `${totalEmpty} rooms available right now`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Status / ROAR */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.38, delay: 0.08 }}
              className="relative rounded-2xl overflow-hidden border border-primary/30 bg-card min-h-[150px] flex flex-col items-center justify-center gap-3 p-5"
              data-ocid="quick-status-panel"
            >
              <div
                aria-hidden
                className="absolute inset-0 panel-glow-red opacity-60"
              />
              <div className="relative z-10 burst-container bg-primary px-7 py-3.5">
                <span className="roar-text text-4xl">ROAR</span>
              </div>
              <div className="relative z-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  ROAR BURST ACTIVE
                </p>
              </div>
              <p className="relative z-10 text-xs text-muted-foreground font-body text-center">
                {session?.sessionLabel ?? "No Active Session"}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Room grid section */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pb-6">
          {isError ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="rooms-error-state"
              className="flex flex-col items-center justify-center gap-4 py-24 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-display font-semibold text-foreground">
                  Unable to load room data
                </p>
                <p className="text-sm text-muted-foreground mt-1 font-body">
                  Check your connection or try again
                </p>
              </div>
              <button
                type="button"
                data-ocid="retry-btn"
                onClick={() => refetch()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-display font-semibold hover:opacity-90 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <RefreshCw className="w-4 h-4" />
                Retry
              </button>
            </motion.div>
          ) : (
            <div className="space-y-8">
              {BLOCKS.map((block) => (
                <BlockSection
                  key={block.key}
                  block={block}
                  rooms={allRooms}
                  isHoliday={isHoliday}
                  isLoading={roomsLoading}
                  globalOffset={globalOffsets[block.key] ?? 0}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ══════════════════════ FOOTER (live update + branding) ════════════ */}
      <footer
        data-ocid="dashboard-footer"
        className="border-t"
        style={{
          background: "oklch(0.97 0 0)",
          borderColor: "oklch(0.88 0 0)",
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-[42px] flex items-center justify-between gap-4">
          {/* Live update timestamp */}
          <button
            type="button"
            data-ocid="refresh-btn"
            onClick={() => refetch()}
            aria-label="Refresh room data"
            className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent pulse-dot flex-shrink-0" />
            <span data-ocid="last-updated-ts">
              Last updated: {formatTS(lastUpdated)}
            </span>
            <RefreshCw className="w-3 h-3 ml-0.5" />
          </button>

          {/* Branding */}
          <p className="text-xs text-muted-foreground font-body hidden sm:block">
            © {new Date().getFullYear()}.{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors duration-200"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
