import type { ClusterType } from "@/types";
import { motion } from "motion/react";

interface ClusterToggleProps {
  value: ClusterType;
  onChange: (cluster: ClusterType) => void;
}

const CLUSTERS: { id: ClusterType; label: string; holiday: string }[] = [
  { id: "C1", label: "Cluster C1", holiday: "Sat off" },
  { id: "C2", label: "Cluster C2", holiday: "Mon off" },
];

export function ClusterToggle({ value, onChange }: ClusterToggleProps) {
  return (
    <div
      data-ocid="cluster-toggle"
      className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border"
      aria-label="Select cluster"
    >
      {CLUSTERS.map(({ id, label }) => {
        const isActive = value === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(id)}
            title={label}
            className="relative px-4 py-1.5 rounded-lg text-sm font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-secondary"
          >
            {isActive && (
              <motion.span
                layoutId="cluster-pill"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 26,
                }}
              />
            )}
            <span
              className={[
                "relative z-10 transition-colors duration-200",
                isActive
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              {id}
            </span>
          </button>
        );
      })}
    </div>
  );
}
