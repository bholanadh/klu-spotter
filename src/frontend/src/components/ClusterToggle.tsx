import type { ClusterType } from "@/types";
import { motion } from "motion/react";

interface ClusterToggleProps {
  value: ClusterType;
  onChange: (cluster: ClusterType) => void;
}

const CLUSTERS: ClusterType[] = ["C1", "C2"];

export function ClusterToggle({ value, onChange }: ClusterToggleProps) {
  return (
    <div
      data-ocid="cluster-toggle"
      className="flex items-center gap-1 p-1 rounded-xl bg-card border border-border"
      aria-label="Select cluster"
    >
      {CLUSTERS.map((cluster) => {
        const isActive = value === cluster;
        return (
          <button
            key={cluster}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(cluster)}
            className="relative px-5 py-2 rounded-lg text-sm font-display font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            {isActive && (
              <motion.span
                layoutId="cluster-pill"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: "spring", bounce: 0.22, duration: 0.38 }}
              />
            )}
            <span
              className={`relative z-10 ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {cluster}
            </span>
          </button>
        );
      })}
    </div>
  );
}
